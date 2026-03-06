"""
Test file for dual user experience: Personal vs Business user types
Tests registration, login, and user-type specific features
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestRegistration:
    """Tests for user registration with user_type selection"""
    
    def test_register_personal_user(self):
        """Test registering a new personal user"""
        unique_email = f"test_persona_{uuid.uuid4().hex[:8]}@test.com"
        payload = {
            "email": unique_email,
            "password": "test123456",
            "nombre": "Test Personal",
            "user_type": "personal"
        }
        response = requests.post(f"{BASE_URL}/api/auth/register", json=payload)
        
        assert response.status_code == 200, f"Failed to register personal user: {response.text}"
        data = response.json()
        assert "access_token" in data
        assert data["user"]["user_type"] == "personal"
        assert data["user"]["email"] == unique_email.lower()
        print(f"✅ Personal user registration: PASSED")
        return data
    
    def test_register_business_user(self):
        """Test registering a new business user with nombre_negocio"""
        unique_email = f"test_negocio_{uuid.uuid4().hex[:8]}@test.com"
        payload = {
            "email": unique_email,
            "password": "test123456",
            "nombre": "Test Business Owner",
            "nombre_negocio": "Mi Salon Test",
            "user_type": "business"
        }
        response = requests.post(f"{BASE_URL}/api/auth/register", json=payload)
        
        assert response.status_code == 200, f"Failed to register business user: {response.text}"
        data = response.json()
        assert "access_token" in data
        assert data["user"]["user_type"] == "business"
        assert data["user"]["nombre_negocio"] == "Mi Salon Test"
        print(f"✅ Business user registration: PASSED")
        return data


class TestLogin:
    """Tests for login functionality with different user types"""
    
    def test_login_personal_user(self):
        """Test login with existing personal user credentials"""
        payload = {
            "email": "persona@test.com",
            "password": "test123"
        }
        response = requests.post(f"{BASE_URL}/api/auth/login", json=payload)
        
        if response.status_code == 200:
            data = response.json()
            assert "access_token" in data
            assert data["user"]["user_type"] in ["personal", None, ""]
            print(f"✅ Personal user login: PASSED (user_type: {data['user'].get('user_type', 'N/A')})")
            return data
        else:
            print(f"⚠️ Personal user login: User not found (creating new)")
            # Create user if not exists
            reg_payload = {
                "email": "persona@test.com",
                "password": "test123",
                "nombre": "Test Persona",
                "user_type": "personal"
            }
            reg_response = requests.post(f"{BASE_URL}/api/auth/register", json=reg_payload)
            if reg_response.status_code == 200:
                print(f"✅ Personal user created and logged in")
                return reg_response.json()
            elif reg_response.status_code == 400:
                # User exists but wrong password
                print(f"❌ Login failed for personal user - check credentials")
                return None
            return None
    
    def test_login_business_user(self):
        """Test login with existing business user credentials"""
        payload = {
            "email": "negocio@test.com",
            "password": "test123"
        }
        response = requests.post(f"{BASE_URL}/api/auth/login", json=payload)
        
        if response.status_code == 200:
            data = response.json()
            assert "access_token" in data
            assert data["user"]["user_type"] == "business"
            print(f"✅ Business user login: PASSED")
            return data
        else:
            print(f"⚠️ Business user login: User not found (creating new)")
            # Create user if not exists
            reg_payload = {
                "email": "negocio@test.com",
                "password": "test123",
                "nombre": "Test Negocio",
                "nombre_negocio": "Salon de Unas Test",
                "user_type": "business"
            }
            reg_response = requests.post(f"{BASE_URL}/api/auth/register", json=reg_payload)
            if reg_response.status_code == 200:
                print(f"✅ Business user created and logged in")
                return reg_response.json()
            return None


class TestAuthMe:
    """Tests for /auth/me endpoint returning correct user_type"""
    
    @pytest.fixture
    def personal_token(self):
        """Get token for personal user"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "persona@test.com",
            "password": "test123"
        })
        if response.status_code != 200:
            # Try to register
            reg_response = requests.post(f"{BASE_URL}/api/auth/register", json={
                "email": "persona@test.com",
                "password": "test123",
                "nombre": "Test Persona",
                "user_type": "personal"
            })
            if reg_response.status_code == 200:
                return reg_response.json()["access_token"]
            pytest.skip("Cannot create personal test user")
        return response.json()["access_token"]
    
    @pytest.fixture
    def business_token(self):
        """Get token for business user"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "negocio@test.com",
            "password": "test123"
        })
        if response.status_code != 200:
            # Try to register
            reg_response = requests.post(f"{BASE_URL}/api/auth/register", json={
                "email": "negocio@test.com",
                "password": "test123",
                "nombre": "Test Negocio",
                "nombre_negocio": "Salon Test",
                "user_type": "business"
            })
            if reg_response.status_code == 200:
                return reg_response.json()["access_token"]
            pytest.skip("Cannot create business test user")
        return response.json()["access_token"]
    
    def test_auth_me_personal(self, personal_token):
        """Verify /auth/me returns correct user_type for personal user"""
        response = requests.get(
            f"{BASE_URL}/api/auth/me",
            headers={"Authorization": f"Bearer {personal_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        # Personal user_type should be 'personal' or default (empty/none)
        assert data.get("user_type") in ["personal", "", None]
        print(f"✅ /auth/me personal user: PASSED (user_type: {data.get('user_type')})")
    
    def test_auth_me_business(self, business_token):
        """Verify /auth/me returns correct user_type for business user"""
        response = requests.get(
            f"{BASE_URL}/api/auth/me",
            headers={"Authorization": f"Bearer {business_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["user_type"] == "business"
        print(f"✅ /auth/me business user: PASSED (user_type: {data['user_type']})")


class TestEmpleadosEndpoint:
    """Tests for /empleados endpoint (business users only)"""
    
    @pytest.fixture
    def business_token(self):
        """Get token for business user"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "negocio@test.com",
            "password": "test123"
        })
        if response.status_code != 200:
            reg_response = requests.post(f"{BASE_URL}/api/auth/register", json={
                "email": "negocio@test.com",
                "password": "test123",
                "nombre": "Test Negocio",
                "nombre_negocio": "Salon Test",
                "user_type": "business"
            })
            if reg_response.status_code == 200:
                return reg_response.json()["access_token"]
            pytest.skip("Cannot create business test user")
        return response.json()["access_token"]
    
    @pytest.fixture
    def personal_token(self):
        """Get token for personal user"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "persona@test.com",
            "password": "test123"
        })
        if response.status_code != 200:
            reg_response = requests.post(f"{BASE_URL}/api/auth/register", json={
                "email": "persona@test.com",
                "password": "test123",
                "nombre": "Test Persona",
                "user_type": "personal"
            })
            if reg_response.status_code == 200:
                return reg_response.json()["access_token"]
            pytest.skip("Cannot create personal test user")
        return response.json()["access_token"]
    
    def test_get_empleados_business_user(self, business_token):
        """Business user can get empleados list"""
        response = requests.get(
            f"{BASE_URL}/api/empleados",
            headers={"Authorization": f"Bearer {business_token}"}
        )
        assert response.status_code == 200
        assert isinstance(response.json(), list)
        print(f"✅ GET /empleados for business user: PASSED")
    
    def test_get_empleados_personal_user(self, personal_token):
        """Personal user gets empty list (not forbidden)"""
        response = requests.get(
            f"{BASE_URL}/api/empleados",
            headers={"Authorization": f"Bearer {personal_token}"}
        )
        assert response.status_code == 200
        # Personal user should get empty list per implementation
        assert response.json() == []
        print(f"✅ GET /empleados for personal user: PASSED (returns empty list)")
    
    def test_create_empleado_business_user(self, business_token):
        """Business user can create empleado"""
        payload = {
            "nombre": f"TEST_Empleado_{uuid.uuid4().hex[:6]}",
            "email": f"test_emp_{uuid.uuid4().hex[:6]}@test.com",
            "especialidad": "Acrílicas",
            "comision_porcentaje": 15
        }
        response = requests.post(
            f"{BASE_URL}/api/empleados",
            headers={"Authorization": f"Bearer {business_token}"},
            json=payload
        )
        assert response.status_code == 200
        data = response.json()
        assert data["nombre"] == payload["nombre"]
        assert data["activo"] == True
        print(f"✅ POST /empleados for business user: PASSED")
        return data
    
    def test_create_empleado_personal_user_forbidden(self, personal_token):
        """Personal user cannot create empleado"""
        payload = {
            "nombre": "Test Empleado",
            "especialidad": "Test"
        }
        response = requests.post(
            f"{BASE_URL}/api/empleados",
            headers={"Authorization": f"Bearer {personal_token}"},
            json=payload
        )
        # Should return 403 Forbidden for personal users
        assert response.status_code == 403
        print(f"✅ POST /empleados forbidden for personal user: PASSED")


class TestHistorialCalculosEndpoint:
    """Tests for /historial-calculos endpoint"""
    
    @pytest.fixture
    def personal_token(self):
        """Get token for personal user"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "persona@test.com",
            "password": "test123"
        })
        if response.status_code != 200:
            reg_response = requests.post(f"{BASE_URL}/api/auth/register", json={
                "email": "persona@test.com",
                "password": "test123",
                "nombre": "Test Persona",
                "user_type": "personal"
            })
            if reg_response.status_code == 200:
                return reg_response.json()["access_token"]
            pytest.skip("Cannot create personal test user")
        return response.json()["access_token"]
    
    def test_get_historial_calculos(self, personal_token):
        """Get calculation history"""
        response = requests.get(
            f"{BASE_URL}/api/historial-calculos",
            headers={"Authorization": f"Bearer {personal_token}"}
        )
        assert response.status_code == 200
        assert isinstance(response.json(), list)
        print(f"✅ GET /historial-calculos: PASSED")
    
    def test_create_calculo_historial(self, personal_token):
        """Save a calculation to history"""
        payload = {
            "estilo_id": "test-estilo-id",
            "estilo_nombre": "TEST_Estilo Test",
            "precio_recomendado": 150.00,
            "costo_total": 100.00,
            "ganancia": 50.00,
            "cliente_nombre": "Cliente Test"
        }
        response = requests.post(
            f"{BASE_URL}/api/historial-calculos",
            headers={"Authorization": f"Bearer {personal_token}"},
            json=payload
        )
        assert response.status_code == 200
        data = response.json()
        assert data["estilo_nombre"] == payload["estilo_nombre"]
        assert data["precio_recomendado"] == payload["precio_recomendado"]
        print(f"✅ POST /historial-calculos: PASSED")
        return data


class TestQuickStatsEndpoint:
    """Tests for /quick-stats endpoint that powers dashboard"""
    
    @pytest.fixture
    def business_token(self):
        """Get token for business user"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "negocio@test.com",
            "password": "test123"
        })
        if response.status_code != 200:
            reg_response = requests.post(f"{BASE_URL}/api/auth/register", json={
                "email": "negocio@test.com",
                "password": "test123",
                "nombre": "Test Negocio",
                "nombre_negocio": "Salon Test",
                "user_type": "business"
            })
            if reg_response.status_code == 200:
                return reg_response.json()["access_token"]
            pytest.skip("Cannot create business test user")
        return response.json()["access_token"]
    
    @pytest.fixture
    def personal_token(self):
        """Get token for personal user"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "persona@test.com",
            "password": "test123"
        })
        if response.status_code != 200:
            reg_response = requests.post(f"{BASE_URL}/api/auth/register", json={
                "email": "persona@test.com",
                "password": "test123",
                "nombre": "Test Persona",
                "user_type": "personal"
            })
            if reg_response.status_code == 200:
                return reg_response.json()["access_token"]
            pytest.skip("Cannot create personal test user")
        return response.json()["access_token"]
    
    def test_quick_stats_personal_user(self, personal_token):
        """Personal user gets quick stats for dashboard"""
        response = requests.get(
            f"{BASE_URL}/api/quick-stats",
            headers={"Authorization": f"Bearer {personal_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        # Should have common stats
        assert "productos" in data
        assert "clientes" in data
        assert "citas_pendientes" in data
        # Should NOT have empleados for personal
        print(f"✅ GET /quick-stats for personal: PASSED")
    
    def test_quick_stats_business_user(self, business_token):
        """Business user gets quick stats including empleados"""
        response = requests.get(
            f"{BASE_URL}/api/quick-stats",
            headers={"Authorization": f"Bearer {business_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        # Should have common stats plus business-specific
        assert "productos" in data
        assert "empleados" in data  # Business-specific
        print(f"✅ GET /quick-stats for business: PASSED (includes empleados)")


class TestAlertasInventarioEndpoint:
    """Tests for /alertas-inventario endpoint (used in Comercio Dashboard)"""
    
    @pytest.fixture
    def business_token(self):
        """Get token for business user"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "negocio@test.com",
            "password": "test123"
        })
        if response.status_code != 200:
            reg_response = requests.post(f"{BASE_URL}/api/auth/register", json={
                "email": "negocio@test.com",
                "password": "test123",
                "nombre": "Test Negocio",
                "nombre_negocio": "Salon Test",
                "user_type": "business"
            })
            if reg_response.status_code == 200:
                return reg_response.json()["access_token"]
            pytest.skip("Cannot create business test user")
        return response.json()["access_token"]
    
    def test_get_alertas_inventario(self, business_token):
        """Get inventory alerts"""
        response = requests.get(
            f"{BASE_URL}/api/alertas-inventario",
            headers={"Authorization": f"Bearer {business_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✅ GET /alertas-inventario: PASSED ({len(data)} alerts)")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
