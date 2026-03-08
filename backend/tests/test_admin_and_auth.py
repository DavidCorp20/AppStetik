"""
Backend API Tests for NailCost Pro Admin Dashboard and Auth
Tests the following features:
- Admin login and authentication
- Admin stats API endpoint
- Admin subscriptions API endpoint
- Admin invoices API endpoint
- Test user login (seed data users)
- System stats verification
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://salon-margin-tool.preview.emergentagent.com').rstrip('/')

# Test Credentials
ADMIN_CREDENTIALS = {
    "email": "admin@nailcost.pro",
    "password": "NailCost@Adm1n#2024Secure"
}

TEST_BUSINESS_CREDENTIALS = {
    "email": "elite.nails@test.com",
    "password": "Test123!"
}

TEST_PERSONAL_CREDENTIALS = {
    "email": "maria.personal@test.com", 
    "password": "Test123!"
}


class TestAdminAuthentication:
    """Admin authentication and login tests"""
    
    def test_admin_login_success(self):
        """Test admin can login with correct credentials"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json=ADMIN_CREDENTIALS
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "access_token" in data, "Response should contain access_token"
        assert "user" in data, "Response should contain user object"
        assert data["user"]["role"] == "admin", "User should have admin role"
        assert data["user"]["email"] == ADMIN_CREDENTIALS["email"]
        print(f"✅ Admin login successful - role: {data['user']['role']}")
    
    def test_admin_login_wrong_password(self):
        """Test admin login fails with wrong password"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_CREDENTIALS["email"], "password": "wrongpassword"}
        )
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✅ Admin login with wrong password correctly rejected")
    
    def test_admin_login_wrong_email(self):
        """Test admin login fails with wrong email"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "wrong@email.com", "password": ADMIN_CREDENTIALS["password"]}
        )
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✅ Admin login with wrong email correctly rejected")


class TestAdminStats:
    """Admin stats API tests"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin authentication token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json=ADMIN_CREDENTIALS
        )
        if response.status_code == 200:
            return response.json().get("access_token")
        pytest.skip("Admin authentication failed")
    
    def test_admin_stats_endpoint(self, admin_token):
        """Test admin stats endpoint returns correct data"""
        response = requests.get(
            f"{BASE_URL}/api/admin/stats",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        # Check required fields exist
        required_fields = [
            "total_users", "premium_users", "free_users", "active_users",
            "disabled_users", "by_type", "total_productos", "total_estilos",
            "total_clientes", "total_citas", "total_facturas"
        ]
        for field in required_fields:
            assert field in data, f"Missing field: {field}"
        
        # Verify data types
        assert isinstance(data["total_users"], int), "total_users should be int"
        assert isinstance(data["total_productos"], int), "total_productos should be int"
        
        # Verify by_type structure
        by_type = data["by_type"]
        assert "personal_basic" in by_type
        assert "personal_premium" in by_type
        assert "business_basic" in by_type
        assert "business_premium" in by_type
        
        print(f"✅ Admin stats: {data['total_users']} users, {data['total_productos']} products, {data['total_facturas']} invoices")
    
    def test_admin_stats_requires_auth(self):
        """Test admin stats endpoint requires authentication"""
        response = requests.get(f"{BASE_URL}/api/admin/stats")
        assert response.status_code == 403 or response.status_code == 401
        print("✅ Admin stats correctly requires authentication")
    
    def test_admin_stats_requires_admin_role(self):
        """Test admin stats endpoint requires admin role"""
        # Login as regular user
        login_response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json=TEST_BUSINESS_CREDENTIALS
        )
        if login_response.status_code != 200:
            pytest.skip("Test user login failed")
        
        token = login_response.json().get("access_token")
        response = requests.get(
            f"{BASE_URL}/api/admin/stats",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 403, f"Expected 403 Forbidden, got {response.status_code}"
        print("✅ Admin stats correctly requires admin role")


class TestAdminSubscriptions:
    """Admin subscriptions API tests"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin authentication token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json=ADMIN_CREDENTIALS
        )
        if response.status_code == 200:
            return response.json().get("access_token")
        pytest.skip("Admin authentication failed")
    
    def test_admin_subscriptions_endpoint(self, admin_token):
        """Test admin subscriptions endpoint returns correct data"""
        response = requests.get(
            f"{BASE_URL}/api/admin/subscriptions",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        
        # Check structure
        assert "subscriptions" in data, "Response should contain subscriptions"
        assert "summary" in data, "Response should contain summary"
        
        # Check summary fields
        summary = data["summary"]
        summary_fields = [
            "total_users", "pending_activation", "in_trial",
            "active_subscriptions", "expired", "monthly_revenue", "annual_revenue"
        ]
        for field in summary_fields:
            assert field in summary, f"Missing summary field: {field}"
        
        # Verify subscriptions is a list
        assert isinstance(data["subscriptions"], list)
        
        # Check subscription object structure if there are any
        if len(data["subscriptions"]) > 0:
            sub = data["subscriptions"][0]
            sub_fields = ["user_id", "email", "nombre", "user_type", "plan", "subscription_status"]
            for field in sub_fields:
                assert field in sub, f"Subscription missing field: {field}"
        
        print(f"✅ Admin subscriptions: {summary['total_users']} users, MRR: ${summary['monthly_revenue']}")
    
    def test_admin_subscriptions_requires_admin(self):
        """Test admin subscriptions endpoint requires admin role"""
        # Login as regular user
        login_response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json=TEST_BUSINESS_CREDENTIALS
        )
        if login_response.status_code != 200:
            pytest.skip("Test user login failed")
        
        token = login_response.json().get("access_token")
        response = requests.get(
            f"{BASE_URL}/api/admin/subscriptions",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 403, f"Expected 403 Forbidden, got {response.status_code}"
        print("✅ Admin subscriptions correctly requires admin role")


class TestAdminInvoices:
    """Admin invoices API tests"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin authentication token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json=ADMIN_CREDENTIALS
        )
        if response.status_code == 200:
            return response.json().get("access_token")
        pytest.skip("Admin authentication failed")
    
    def test_admin_invoices_endpoint(self, admin_token):
        """Test admin invoices endpoint returns correct data"""
        response = requests.get(
            f"{BASE_URL}/api/admin/invoices",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        
        # Check structure
        assert "invoices" in data, "Response should contain invoices"
        assert "summary" in data, "Response should contain summary"
        
        # Check summary fields
        summary = data["summary"]
        summary_fields = ["total_invoices", "pending", "paid", "total_pending_amount", "total_paid_amount"]
        for field in summary_fields:
            assert field in summary, f"Missing summary field: {field}"
        
        print(f"✅ Admin invoices: {summary['total_invoices']} total, {summary['pending']} pending")


class TestTestUserLogin:
    """Test user login tests for seed data users"""
    
    def test_business_user_login(self):
        """Test business user (elite.nails@test.com) can login"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json=TEST_BUSINESS_CREDENTIALS
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "access_token" in data
        assert data["user"]["user_type"] == "business"
        assert data["user"]["plan"] == "premium"
        print(f"✅ Business user login successful - type: {data['user']['user_type']}, plan: {data['user']['plan']}")
    
    def test_personal_user_login(self):
        """Test personal user (maria.personal@test.com) can login"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json=TEST_PERSONAL_CREDENTIALS
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "access_token" in data
        assert data["user"]["user_type"] == "personal"
        print(f"✅ Personal user login successful - type: {data['user']['user_type']}")
    
    def test_business_user_has_products(self):
        """Test that elite.nails@test.com has products data"""
        # Login
        login_response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json=TEST_BUSINESS_CREDENTIALS
        )
        token = login_response.json().get("access_token")
        
        # Get products
        response = requests.get(
            f"{BASE_URL}/api/productos",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list), "Products should be a list"
        assert len(data) > 0, "Business user should have products"
        print(f"✅ Business user has {len(data)} products")
    
    def test_business_user_has_styles(self):
        """Test that elite.nails@test.com has styles data"""
        # Login
        login_response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json=TEST_BUSINESS_CREDENTIALS
        )
        token = login_response.json().get("access_token")
        
        # Get styles
        response = requests.get(
            f"{BASE_URL}/api/estilos",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list), "Styles should be a list"
        assert len(data) > 0, "Business user should have styles"
        print(f"✅ Business user has {len(data)} styles")
    
    def test_business_user_has_clients(self):
        """Test that elite.nails@test.com has clients data"""
        # Login
        login_response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json=TEST_BUSINESS_CREDENTIALS
        )
        token = login_response.json().get("access_token")
        
        # Get clients
        response = requests.get(
            f"{BASE_URL}/api/clientes",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list), "Clients should be a list"
        assert len(data) > 0, "Business user should have clients"
        print(f"✅ Business user has {len(data)} clients")
    
    def test_business_user_has_invoices(self):
        """Test that elite.nails@test.com has invoices data"""
        # Login
        login_response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json=TEST_BUSINESS_CREDENTIALS
        )
        token = login_response.json().get("access_token")
        
        # Get invoices
        response = requests.get(
            f"{BASE_URL}/api/facturas",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list), "Invoices should be a list"
        assert len(data) > 0, "Business user should have invoices"
        print(f"✅ Business user has {len(data)} invoices")


class TestSystemDataConsistency:
    """Test system data consistency - admin stats match actual data"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin authentication token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json=ADMIN_CREDENTIALS
        )
        if response.status_code == 200:
            return response.json().get("access_token")
        pytest.skip("Admin authentication failed")
    
    def test_stats_show_real_data(self, admin_token):
        """Verify that admin stats show real data from seed users"""
        response = requests.get(
            f"{BASE_URL}/api/admin/stats",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        
        data = response.json()
        
        # Based on seed_data.py, we expect these minimums
        # 6 test users were created, plus potential other users
        assert data["total_productos"] >= 30, f"Expected at least 30 products from seed data, got {data['total_productos']}"
        assert data["total_estilos"] >= 20, f"Expected at least 20 styles from seed data, got {data['total_estilos']}"
        assert data["total_clientes"] >= 20, f"Expected at least 20 clients from seed data, got {data['total_clientes']}"
        assert data["total_facturas"] >= 20, f"Expected at least 20 invoices from seed data, got {data['total_facturas']}"
        
        print(f"✅ System data verified: {data['total_productos']} products, {data['total_estilos']} styles, {data['total_clientes']} clients, {data['total_facturas']} invoices")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
