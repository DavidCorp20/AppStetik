"""
Test Facturacion (Invoice) Feature for NailCost Pro
Tests: GET /api/facturas, POST /api/facturas, PUT /api/facturas/{id}/estado, DELETE /api/facturas/{id}
"""
import pytest
import requests
import os
import uuid
from datetime import datetime

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# ========================
# Test Fixtures
# ========================
@pytest.fixture(scope="module")
def api_client():
    """Shared requests session"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session

@pytest.fixture(scope="module")
def business_auth_token(api_client):
    """Get authentication token for business user"""
    response = api_client.post(f"{BASE_URL}/api/auth/login", json={
        "email": "negocio@test.com",
        "password": "test123"
    })
    if response.status_code == 200:
        return response.json().get("access_token")
    pytest.skip("Business user authentication failed - skipping tests")

@pytest.fixture(scope="module")
def authenticated_client(api_client, business_auth_token):
    """Session with auth header for business user"""
    api_client.headers.update({"Authorization": f"Bearer {business_auth_token}"})
    return api_client

@pytest.fixture(scope="module")
def test_cliente(authenticated_client):
    """Get existing client or create one for testing"""
    # First try to get existing clients
    response = authenticated_client.get(f"{BASE_URL}/api/clientes")
    if response.status_code == 200:
        clientes = response.json()
        if clientes:
            return clientes[0]
    
    # Create a test client if none exists
    response = authenticated_client.post(f"{BASE_URL}/api/clientes", json={
        "nombre": "TEST_Cliente_Facturacion",
        "telefono": "+58 414-1234567",
        "email": "test_cliente@test.com",
        "notas": "Cliente de prueba para facturación"
    })
    if response.status_code in [200, 201]:
        return response.json()
    
    pytest.skip("Could not get or create test client")

# ========================
# Invoice API Tests
# ========================
class TestInvoiceAuthentication:
    """Test authentication requirements for invoice endpoints"""
    
    def test_get_facturas_without_auth_returns_401(self, api_client):
        """GET /api/facturas without auth should return 401"""
        # Create a fresh session without auth
        no_auth_session = requests.Session()
        no_auth_session.headers.update({"Content-Type": "application/json"})
        
        response = no_auth_session.get(f"{BASE_URL}/api/facturas")
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("✅ GET /api/facturas returns 401 without auth")


class TestGetInvoices:
    """Test GET /api/facturas endpoint"""
    
    def test_get_facturas_authenticated(self, authenticated_client):
        """GET /api/facturas should return list of invoices for authenticated user"""
        response = authenticated_client.get(f"{BASE_URL}/api/facturas")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"✅ GET /api/facturas returns {len(data)} invoices")
        
        # If there are invoices, validate structure
        if data:
            factura = data[0]
            assert "id" in factura, "Invoice should have id"
            assert "numero" in factura, "Invoice should have numero"
            assert "cliente_nombre" in factura, "Invoice should have cliente_nombre"
            assert "total" in factura, "Invoice should have total"
            assert "estado" in factura, "Invoice should have estado"
            print(f"✅ Invoice structure validated: #{factura['numero']} - {factura['cliente_nombre']} - ${factura['total']}")


class TestCreateInvoice:
    """Test POST /api/facturas endpoint"""
    
    def test_create_factura_with_items(self, authenticated_client, test_cliente):
        """POST /api/facturas should create new invoice"""
        unique_id = str(uuid.uuid4())[:8]
        
        invoice_data = {
            "cliente_id": test_cliente["id"],
            "cliente_nombre": test_cliente["nombre"],
            "cliente_telefono": test_cliente.get("telefono", ""),
            "cliente_email": test_cliente.get("email", ""),
            "items": [
                {"descripcion": "TEST_Manicure Básico", "cantidad": 1, "precio_unitario": 25.00},
                {"descripcion": "TEST_French Tips", "cantidad": 1, "precio_unitario": 15.00}
            ],
            "subtotal": 40.00,
            "descuento": 5.00,
            "total": 35.00,
            "metodo_pago": "pago_movil",
            "notas": f"Test invoice {unique_id}",
            "estado": "pendiente"
        }
        
        response = authenticated_client.post(f"{BASE_URL}/api/facturas", json=invoice_data)
        
        assert response.status_code in [200, 201], f"Expected 200/201, got {response.status_code}"
        data = response.json()
        
        # Validate response structure
        assert "id" in data, "Created invoice should have id"
        assert "numero" in data, "Created invoice should have numero"
        assert data["cliente_nombre"] == test_cliente["nombre"], "Client name should match"
        assert data["total"] == 35.00, "Total should match"
        assert data["metodo_pago"] == "pago_movil", "Payment method should match"
        assert data["estado"] == "pendiente", "Status should be pendiente"
        assert len(data["items"]) == 2, "Should have 2 items"
        
        print(f"✅ Created invoice #{data['numero']} with id={data['id']}")
        
        # Verify persistence with GET
        get_response = authenticated_client.get(f"{BASE_URL}/api/facturas")
        assert get_response.status_code == 200
        facturas = get_response.json()
        
        created_factura = next((f for f in facturas if f["id"] == data["id"]), None)
        assert created_factura is not None, "Created invoice should be in list"
        print(f"✅ Invoice persisted and verified via GET")
        
        return data
    
    def test_create_factura_with_different_payment_methods(self, authenticated_client, test_cliente):
        """Test creating invoices with different Venezuelan payment methods"""
        payment_methods = ["efectivo", "transferencia", "pago_movil", "tarjeta", "zelle"]
        
        for method in payment_methods:
            invoice_data = {
                "cliente_id": test_cliente["id"],
                "cliente_nombre": test_cliente["nombre"],
                "items": [{"descripcion": f"TEST_{method}_service", "cantidad": 1, "precio_unitario": 20.00}],
                "subtotal": 20.00,
                "descuento": 0,
                "total": 20.00,
                "metodo_pago": method,
                "estado": "pendiente"
            }
            
            response = authenticated_client.post(f"{BASE_URL}/api/facturas", json=invoice_data)
            assert response.status_code in [200, 201], f"Failed to create invoice with {method}"
            data = response.json()
            assert data["metodo_pago"] == method, f"Payment method should be {method}"
            print(f"✅ Invoice with payment method '{method}' created successfully")
    
    def test_create_factura_with_discount(self, authenticated_client, test_cliente):
        """Test creating invoice with discount applied"""
        invoice_data = {
            "cliente_id": test_cliente["id"],
            "cliente_nombre": test_cliente["nombre"],
            "items": [{"descripcion": "TEST_Service with discount", "cantidad": 1, "precio_unitario": 100.00}],
            "subtotal": 100.00,
            "descuento": 20.00,
            "total": 80.00,
            "metodo_pago": "efectivo",
            "estado": "pendiente"
        }
        
        response = authenticated_client.post(f"{BASE_URL}/api/facturas", json=invoice_data)
        assert response.status_code in [200, 201]
        data = response.json()
        
        assert data["subtotal"] == 100.00, "Subtotal should be 100"
        assert data["descuento"] == 20.00, "Discount should be 20"
        assert data["total"] == 80.00, "Total should be 80 after discount"
        print(f"✅ Invoice with discount created: subtotal=${data['subtotal']}, descuento=${data['descuento']}, total=${data['total']}")


class TestUpdateInvoiceStatus:
    """Test PUT /api/facturas/{id}/estado endpoint"""
    
    def test_update_status_pendiente_to_pagada(self, authenticated_client, test_cliente):
        """PUT /api/facturas/{id}/estado should update invoice status"""
        # First create a pending invoice
        invoice_data = {
            "cliente_id": test_cliente["id"],
            "cliente_nombre": test_cliente["nombre"],
            "items": [{"descripcion": "TEST_Status update service", "cantidad": 1, "precio_unitario": 50.00}],
            "subtotal": 50.00,
            "descuento": 0,
            "total": 50.00,
            "metodo_pago": "transferencia",
            "estado": "pendiente"
        }
        
        create_response = authenticated_client.post(f"{BASE_URL}/api/facturas", json=invoice_data)
        assert create_response.status_code in [200, 201]
        factura = create_response.json()
        factura_id = factura["id"]
        
        assert factura["estado"] == "pendiente", "Initial status should be pendiente"
        print(f"✅ Created pending invoice #{factura['numero']}")
        
        # Update status to pagada
        update_response = authenticated_client.put(
            f"{BASE_URL}/api/facturas/{factura_id}/estado",
            json={"estado": "pagada"}
        )
        
        assert update_response.status_code == 200, f"Expected 200, got {update_response.status_code}"
        print(f"✅ Status updated to 'pagada'")
        
        # Verify the update persisted
        get_response = authenticated_client.get(f"{BASE_URL}/api/facturas")
        assert get_response.status_code == 200
        facturas = get_response.json()
        
        updated_factura = next((f for f in facturas if f["id"] == factura_id), None)
        assert updated_factura is not None, "Updated invoice should exist"
        assert updated_factura["estado"] == "pagada", "Status should be pagada after update"
        print(f"✅ Status change verified via GET: {updated_factura['estado']}")
    
    def test_update_status_to_anulada(self, authenticated_client, test_cliente):
        """Test updating invoice status to anulada (cancelled)"""
        invoice_data = {
            "cliente_id": test_cliente["id"],
            "cliente_nombre": test_cliente["nombre"],
            "items": [{"descripcion": "TEST_To be cancelled", "cantidad": 1, "precio_unitario": 30.00}],
            "subtotal": 30.00,
            "descuento": 0,
            "total": 30.00,
            "metodo_pago": "efectivo",
            "estado": "pendiente"
        }
        
        create_response = authenticated_client.post(f"{BASE_URL}/api/facturas", json=invoice_data)
        factura = create_response.json()
        
        update_response = authenticated_client.put(
            f"{BASE_URL}/api/facturas/{factura['id']}/estado",
            json={"estado": "anulada"}
        )
        
        assert update_response.status_code == 200
        print(f"✅ Invoice #{factura['numero']} status updated to 'anulada'")
    
    def test_update_nonexistent_invoice_returns_404(self, authenticated_client):
        """PUT /api/facturas/{invalid_id}/estado should return 404"""
        fake_id = str(uuid.uuid4())
        response = authenticated_client.put(
            f"{BASE_URL}/api/facturas/{fake_id}/estado",
            json={"estado": "pagada"}
        )
        assert response.status_code == 404, f"Expected 404 for non-existent invoice, got {response.status_code}"
        print("✅ Returns 404 for non-existent invoice")


class TestDeleteInvoice:
    """Test DELETE /api/facturas/{id} endpoint"""
    
    def test_delete_factura(self, authenticated_client, test_cliente):
        """DELETE /api/facturas/{id} should delete invoice"""
        # Create invoice to delete
        invoice_data = {
            "cliente_id": test_cliente["id"],
            "cliente_nombre": test_cliente["nombre"],
            "items": [{"descripcion": "TEST_To be deleted", "cantidad": 1, "precio_unitario": 15.00}],
            "subtotal": 15.00,
            "descuento": 0,
            "total": 15.00,
            "metodo_pago": "efectivo",
            "estado": "pendiente"
        }
        
        create_response = authenticated_client.post(f"{BASE_URL}/api/facturas", json=invoice_data)
        factura = create_response.json()
        factura_id = factura["id"]
        
        # Delete the invoice
        delete_response = authenticated_client.delete(f"{BASE_URL}/api/facturas/{factura_id}")
        assert delete_response.status_code in [200, 204], f"Expected 200/204, got {delete_response.status_code}"
        print(f"✅ Invoice #{factura['numero']} deleted")
        
        # Verify deletion
        get_response = authenticated_client.get(f"{BASE_URL}/api/facturas")
        facturas = get_response.json()
        deleted_factura = next((f for f in facturas if f["id"] == factura_id), None)
        assert deleted_factura is None, "Deleted invoice should not exist in list"
        print(f"✅ Deletion verified via GET")
    
    def test_delete_nonexistent_invoice_returns_404(self, authenticated_client):
        """DELETE /api/facturas/{invalid_id} should return 404"""
        fake_id = str(uuid.uuid4())
        response = authenticated_client.delete(f"{BASE_URL}/api/facturas/{fake_id}")
        assert response.status_code == 404, f"Expected 404 for non-existent invoice, got {response.status_code}"
        print("✅ Returns 404 for deleting non-existent invoice")


class TestInvoiceStats:
    """Test invoice statistics calculation"""
    
    def test_get_facturas_for_stats_calculation(self, authenticated_client):
        """Verify we can calculate stats from invoices data"""
        response = authenticated_client.get(f"{BASE_URL}/api/facturas")
        assert response.status_code == 200
        facturas = response.json()
        
        # Calculate stats like the frontend does
        total_facturado = sum(f["total"] for f in facturas if f["estado"] == "pagada")
        pendientes = len([f for f in facturas if f["estado"] == "pendiente"])
        total_facturas = len(facturas)
        
        print(f"✅ Invoice Stats - Total: {total_facturas}, Facturado (pagado): ${total_facturado:.2f}, Pendientes: {pendientes}")
        
        # Basic sanity checks
        assert total_facturas >= 0, "Total should be >= 0"
        assert total_facturado >= 0, "Total facturado should be >= 0"
        assert pendientes >= 0, "Pendientes should be >= 0"


class TestCleanup:
    """Clean up test data"""
    
    def test_cleanup_test_invoices(self, authenticated_client):
        """Clean up TEST_ prefixed invoices"""
        response = authenticated_client.get(f"{BASE_URL}/api/facturas")
        if response.status_code == 200:
            facturas = response.json()
            test_facturas = [f for f in facturas if any(
                item.get("descripcion", "").startswith("TEST_") 
                for item in f.get("items", [])
            )]
            
            deleted_count = 0
            for factura in test_facturas:
                delete_response = authenticated_client.delete(f"{BASE_URL}/api/facturas/{factura['id']}")
                if delete_response.status_code in [200, 204]:
                    deleted_count += 1
            
            print(f"✅ Cleanup: Deleted {deleted_count} test invoices")
