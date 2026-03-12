"""
Test Suite for Business Sub-Users (Multi-User System) - Phase 1
Tests CRUD operations for business_users, roles, permissions and sub-user login.
"""
import pytest
import requests
import os
import uuid

# Get base URL from environment
BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
OWNER_CREDENTIALS = {"email": "elite.nails@test.com", "password": "Test123!"}
EMPLOYEE_CREDENTIALS = {"email": "ana.garcia@elite.nails.test", "password": "SecurePass123!"}
ADMIN_CREDENTIALS = {"email": "carlos.admin@elite.nails.test", "password": "AdminPass456!"}

# Unique test email prefix for cleanup
TEST_EMAIL_SUFFIX = f"@test-{uuid.uuid4().hex[:8]}.com"


class TestOwnerLogin:
    """Test that business owner (comercio) can login"""
    
    def test_owner_login_success(self):
        """Owner login with valid credentials returns token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json=OWNER_CREDENTIALS)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "access_token" in data
        assert "user" in data
        assert data["user"]["email"] == OWNER_CREDENTIALS["email"]
        assert data["user"]["user_type"] == "business"
        print(f"✓ Owner login successful: {data['user']['nombre']}")


class TestSubUserLogin:
    """Test that business sub-users can login"""
    
    def test_employee_subuser_login(self):
        """Employee sub-user login with valid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json=EMPLOYEE_CREDENTIALS)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "access_token" in data
        assert "user" in data
        assert data["user"]["email"] == EMPLOYEE_CREDENTIALS["email"]
        assert data["user"]["role"] == "empleado"
        print(f"✓ Employee sub-user login successful: {data['user']['nombre']}")
    
    def test_admin_subuser_login(self):
        """Admin sub-user login with valid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json=ADMIN_CREDENTIALS)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "access_token" in data
        assert "user" in data
        assert data["user"]["email"] == ADMIN_CREDENTIALS["email"]
        assert data["user"]["role"] == "administrador"
        print(f"✓ Admin sub-user login successful: {data['user']['nombre']}")


class TestBusinessUsersEndpoints:
    """Test CRUD operations for business sub-users"""
    
    @pytest.fixture
    def owner_token(self):
        """Get owner authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json=OWNER_CREDENTIALS)
        if response.status_code != 200:
            pytest.skip("Owner login failed - skipping authenticated tests")
        return response.json()["access_token"]
    
    @pytest.fixture
    def admin_token(self):
        """Get admin sub-user authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json=ADMIN_CREDENTIALS)
        if response.status_code != 200:
            pytest.skip("Admin sub-user login failed - skipping tests")
        return response.json()["access_token"]
    
    @pytest.fixture
    def employee_token(self):
        """Get employee sub-user authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json=EMPLOYEE_CREDENTIALS)
        if response.status_code != 200:
            pytest.skip("Employee sub-user login failed - skipping tests")
        return response.json()["access_token"]
    
    # ===================
    # GET /api/business/users - List sub-users
    # ===================
    def test_list_users_as_owner(self, owner_token):
        """Owner can list all sub-users"""
        response = requests.get(
            f"{BASE_URL}/api/business/users",
            headers={"Authorization": f"Bearer {owner_token}"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        users = response.json()
        assert isinstance(users, list)
        # Should have at least the 2 existing sub-users
        assert len(users) >= 2, f"Expected at least 2 sub-users, got {len(users)}"
        
        # Verify response structure
        for user in users:
            assert "id" in user
            assert "business_id" in user
            assert "email" in user
            assert "nombre" in user
            assert "role" in user
            assert "permissions" in user
        print(f"✓ Owner can list {len(users)} sub-users")
    
    def test_list_users_as_admin(self, admin_token):
        """Admin can list all sub-users (view permission)"""
        response = requests.get(
            f"{BASE_URL}/api/business/users",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        users = response.json()
        assert isinstance(users, list)
        print(f"✓ Admin can list sub-users")
    
    def test_list_users_denied_for_employee(self, employee_token):
        """Employee cannot list users (no permission)"""
        response = requests.get(
            f"{BASE_URL}/api/business/users",
            headers={"Authorization": f"Bearer {employee_token}"}
        )
        assert response.status_code == 403, f"Expected 403, got {response.status_code}: {response.text}"
        print("✓ Employee correctly denied access to list users")
    
    # ===================
    # GET /api/business/users/{id} - Get specific sub-user
    # ===================
    def test_get_specific_user_as_owner(self, owner_token):
        """Owner can get specific sub-user details"""
        # First get the list to find a user ID
        list_response = requests.get(
            f"{BASE_URL}/api/business/users",
            headers={"Authorization": f"Bearer {owner_token}"}
        )
        users = list_response.json()
        if not users:
            pytest.skip("No sub-users to test")
        
        user_id = users[0]["id"]
        response = requests.get(
            f"{BASE_URL}/api/business/users/{user_id}",
            headers={"Authorization": f"Bearer {owner_token}"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        user = response.json()
        assert user["id"] == user_id
        assert "email" in user
        assert "nombre" in user
        assert "role" in user
        assert "permissions" in user
        print(f"✓ Owner can get specific user: {user['nombre']}")
    
    def test_get_nonexistent_user_returns_404(self, owner_token):
        """Getting non-existent user returns 404"""
        fake_id = str(uuid.uuid4())
        response = requests.get(
            f"{BASE_URL}/api/business/users/{fake_id}",
            headers={"Authorization": f"Bearer {owner_token}"}
        )
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("✓ Non-existent user correctly returns 404")
    
    # ===================
    # POST /api/business/users - Create sub-user
    # ===================
    def test_create_user_as_owner(self, owner_token):
        """Owner can create new sub-user"""
        unique_email = f"test.empleado.{uuid.uuid4().hex[:8]}@test.nailcost.com"
        new_user = {
            "nombre": "TEST Empleado Nuevo",
            "email": unique_email,
            "password": "TempPass123!",
            "telefono": "0412-TEST123",
            "role": "empleado",
            "especialidad": "Manicure",
            "comision_porcentaje": 10.0
        }
        
        response = requests.post(
            f"{BASE_URL}/api/business/users",
            headers={"Authorization": f"Bearer {owner_token}"},
            json=new_user
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        created = response.json()
        assert created["email"] == unique_email.lower()
        assert created["nombre"] == "TEST Empleado Nuevo"
        assert created["role"] == "empleado"
        assert "permissions" in created
        assert len(created["permissions"]) > 0  # Should have default empleado permissions
        assert "id" in created
        print(f"✓ Owner created new sub-user: {created['email']}")
        
        # Verify can login with new credentials
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": unique_email,
            "password": "TempPass123!"
        })
        assert login_response.status_code == 200, "New sub-user should be able to login"
        print(f"✓ New sub-user can login successfully")
        
        # Cleanup - delete the test user
        delete_response = requests.delete(
            f"{BASE_URL}/api/business/users/{created['id']}",
            headers={"Authorization": f"Bearer {owner_token}"}
        )
        assert delete_response.status_code == 200, "Cleanup failed"
        print("✓ Test user cleaned up")
        
        return created["id"]
    
    def test_create_user_denied_for_admin(self, admin_token):
        """Admin cannot create users (only owner can)"""
        new_user = {
            "nombre": "TEST Should Fail",
            "email": f"should.fail.{uuid.uuid4().hex[:8]}@test.com",
            "password": "TempPass123!",
            "role": "empleado"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/business/users",
            headers={"Authorization": f"Bearer {admin_token}"},
            json=new_user
        )
        assert response.status_code == 403, f"Expected 403, got {response.status_code}: {response.text}"
        print("✓ Admin correctly denied from creating users")
    
    def test_create_user_denied_for_employee(self, employee_token):
        """Employee cannot create users"""
        new_user = {
            "nombre": "TEST Should Fail",
            "email": f"should.fail.{uuid.uuid4().hex[:8]}@test.com",
            "password": "TempPass123!",
            "role": "empleado"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/business/users",
            headers={"Authorization": f"Bearer {employee_token}"},
            json=new_user
        )
        assert response.status_code == 403, f"Expected 403, got {response.status_code}: {response.text}"
        print("✓ Employee correctly denied from creating users")
    
    def test_create_user_duplicate_email_fails(self, owner_token):
        """Creating user with existing email fails"""
        duplicate_user = {
            "nombre": "Duplicate Test",
            "email": EMPLOYEE_CREDENTIALS["email"],  # Existing email
            "password": "TempPass123!",
            "role": "empleado"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/business/users",
            headers={"Authorization": f"Bearer {owner_token}"},
            json=duplicate_user
        )
        assert response.status_code == 400, f"Expected 400, got {response.status_code}: {response.text}"
        assert "registrado" in response.json().get("detail", "").lower()
        print("✓ Duplicate email correctly rejected")
    
    # ===================
    # PUT /api/business/users/{id} - Update sub-user
    # ===================
    def test_update_user_as_owner(self, owner_token):
        """Owner can update sub-user details"""
        # Get existing users
        list_response = requests.get(
            f"{BASE_URL}/api/business/users",
            headers={"Authorization": f"Bearer {owner_token}"}
        )
        users = list_response.json()
        
        # Find ana (empleado) to update
        ana_user = next((u for u in users if "ana" in u["email"].lower()), None)
        if not ana_user:
            pytest.skip("Ana user not found for update test")
        
        original_telefono = ana_user.get("telefono", "")
        new_telefono = "0412-UPDATED"
        
        # Update telefono
        response = requests.put(
            f"{BASE_URL}/api/business/users/{ana_user['id']}",
            headers={"Authorization": f"Bearer {owner_token}"},
            json={"telefono": new_telefono}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        updated = response.json()
        assert updated["telefono"] == new_telefono
        print(f"✓ Owner updated sub-user telefono: {original_telefono} -> {new_telefono}")
        
        # Restore original telefono
        requests.put(
            f"{BASE_URL}/api/business/users/{ana_user['id']}",
            headers={"Authorization": f"Bearer {owner_token}"},
            json={"telefono": original_telefono}
        )
        print("✓ Telefono restored to original")
    
    def test_update_user_role_and_permissions(self, owner_token):
        """Owner can change user role and permissions update automatically"""
        # Create test user first
        unique_email = f"test.role.{uuid.uuid4().hex[:8]}@test.nailcost.com"
        create_response = requests.post(
            f"{BASE_URL}/api/business/users",
            headers={"Authorization": f"Bearer {owner_token}"},
            json={
                "nombre": "TEST Role Change",
                "email": unique_email,
                "password": "TempPass123!",
                "role": "empleado"
            }
        )
        created = create_response.json()
        user_id = created["id"]
        
        # Verify initial role is empleado with limited permissions
        assert created["role"] == "empleado"
        empleado_perms_count = len(created["permissions"])
        
        # Update to administrador
        update_response = requests.put(
            f"{BASE_URL}/api/business/users/{user_id}",
            headers={"Authorization": f"Bearer {owner_token}"},
            json={"role": "administrador"}
        )
        assert update_response.status_code == 200
        
        updated = update_response.json()
        assert updated["role"] == "administrador"
        assert len(updated["permissions"]) > empleado_perms_count, "Admin should have more permissions than employee"
        print(f"✓ Role updated: empleado -> administrador, permissions: {empleado_perms_count} -> {len(updated['permissions'])}")
        
        # Cleanup
        requests.delete(
            f"{BASE_URL}/api/business/users/{user_id}",
            headers={"Authorization": f"Bearer {owner_token}"}
        )
        print("✓ Test user cleaned up")
    
    def test_update_user_denied_for_admin(self, admin_token):
        """Admin cannot update users (only owner can)"""
        # Get a user to try to update
        list_response = requests.get(
            f"{BASE_URL}/api/business/users",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        users = list_response.json()
        if not users:
            pytest.skip("No users to test")
        
        user_id = users[0]["id"]
        response = requests.put(
            f"{BASE_URL}/api/business/users/{user_id}",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"telefono": "SHOULD-FAIL"}
        )
        assert response.status_code == 403, f"Expected 403, got {response.status_code}"
        print("✓ Admin correctly denied from updating users")
    
    # ===================
    # DELETE /api/business/users/{id} - Delete sub-user
    # ===================
    def test_delete_user_as_owner(self, owner_token):
        """Owner can delete sub-user"""
        # Create user to delete
        unique_email = f"test.delete.{uuid.uuid4().hex[:8]}@test.nailcost.com"
        create_response = requests.post(
            f"{BASE_URL}/api/business/users",
            headers={"Authorization": f"Bearer {owner_token}"},
            json={
                "nombre": "TEST To Delete",
                "email": unique_email,
                "password": "TempPass123!",
                "role": "empleado"
            }
        )
        user_id = create_response.json()["id"]
        
        # Delete user
        response = requests.delete(
            f"{BASE_URL}/api/business/users/{user_id}",
            headers={"Authorization": f"Bearer {owner_token}"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        # Verify deleted
        get_response = requests.get(
            f"{BASE_URL}/api/business/users/{user_id}",
            headers={"Authorization": f"Bearer {owner_token}"}
        )
        assert get_response.status_code == 404, "Deleted user should return 404"
        print("✓ Owner deleted sub-user and verified deletion")
    
    def test_delete_user_denied_for_admin(self, admin_token, owner_token):
        """Admin cannot delete users (only owner can)"""
        # Get a user to try to delete (but don't actually delete)
        list_response = requests.get(
            f"{BASE_URL}/api/business/users",
            headers={"Authorization": f"Bearer {owner_token}"}
        )
        users = list_response.json()
        if not users:
            pytest.skip("No users to test")
        
        user_id = users[0]["id"]
        response = requests.delete(
            f"{BASE_URL}/api/business/users/{user_id}",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 403, f"Expected 403, got {response.status_code}"
        print("✓ Admin correctly denied from deleting users")


class TestRolesAndPermissionsEndpoints:
    """Test roles and permissions listing endpoints"""
    
    @pytest.fixture
    def owner_token(self):
        """Get owner authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json=OWNER_CREDENTIALS)
        if response.status_code != 200:
            pytest.skip("Owner login failed")
        return response.json()["access_token"]
    
    @pytest.fixture
    def employee_token(self):
        """Get employee authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json=EMPLOYEE_CREDENTIALS)
        if response.status_code != 200:
            pytest.skip("Employee login failed")
        return response.json()["access_token"]
    
    # ===================
    # GET /api/business/roles
    # ===================
    def test_get_roles_as_owner(self, owner_token):
        """Owner can list available roles"""
        response = requests.get(
            f"{BASE_URL}/api/business/roles",
            headers={"Authorization": f"Bearer {owner_token}"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        roles = response.json()
        assert isinstance(roles, list)
        assert len(roles) >= 3, "Should have at least 3 roles (owner, administrador, empleado)"
        
        # Verify structure
        role_ids = [r["id"] for r in roles]
        assert "owner" in role_ids
        assert "administrador" in role_ids
        assert "empleado" in role_ids
        
        for role in roles:
            assert "id" in role
            assert "nombre" in role
            assert "descripcion" in role
            assert "permissions" in role
            assert "total_permissions" in role
        
        print(f"✓ Owner can list {len(roles)} roles: {role_ids}")
    
    def test_get_roles_as_employee(self, employee_token):
        """Employee (business user) can also view roles"""
        response = requests.get(
            f"{BASE_URL}/api/business/roles",
            headers={"Authorization": f"Bearer {employee_token}"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        print("✓ Employee can view available roles")
    
    # ===================
    # GET /api/business/permissions
    # ===================
    def test_get_permissions_as_owner(self, owner_token):
        """Owner can list all available permissions"""
        response = requests.get(
            f"{BASE_URL}/api/business/permissions",
            headers={"Authorization": f"Bearer {owner_token}"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "permissions" in data
        assert "by_category" in data
        
        # Check some expected permissions exist
        perms = data["permissions"]
        assert "view_dashboard" in perms
        assert "manage_users" in perms
        assert "view_clients" in perms
        
        # Check categories
        categories = data["by_category"]
        assert len(categories) > 0
        print(f"✓ Owner can list permissions: {len(perms)} permissions in {len(categories)} categories")
    
    # ===================
    # GET /api/business/my-permissions
    # ===================
    def test_my_permissions_as_owner(self, owner_token):
        """Owner sees all permissions (owner role)"""
        response = requests.get(
            f"{BASE_URL}/api/business/my-permissions",
            headers={"Authorization": f"Bearer {owner_token}"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["role"] == "owner"
        assert "permissions" in data
        assert "manage_users" in data["permissions"], "Owner should have manage_users permission"
        assert data["total_permissions"] > 20, f"Owner should have many permissions, got {data['total_permissions']}"
        print(f"✓ Owner has {data['total_permissions']} permissions (role: {data['role']})")
    
    def test_my_permissions_as_employee(self, employee_token):
        """Employee sees limited permissions"""
        response = requests.get(
            f"{BASE_URL}/api/business/my-permissions",
            headers={"Authorization": f"Bearer {employee_token}"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["role"] == "empleado"
        assert data["is_business_user"] == True
        assert "manage_users" not in data["permissions"], "Employee should NOT have manage_users permission"
        assert "view_dashboard" in data["permissions"], "Employee should have view_dashboard permission"
        print(f"✓ Employee has {data['total_permissions']} permissions (role: {data['role']})")


class TestSubUserDataAccess:
    """Test that sub-users can access business data (clientes, productos, estilos)"""
    
    @pytest.fixture
    def employee_token(self):
        """Get employee authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json=EMPLOYEE_CREDENTIALS)
        if response.status_code != 200:
            pytest.skip("Employee login failed")
        return response.json()["access_token"]
    
    @pytest.fixture
    def admin_token(self):
        """Get admin sub-user authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json=ADMIN_CREDENTIALS)
        if response.status_code != 200:
            pytest.skip("Admin sub-user login failed")
        return response.json()["access_token"]
    
    def test_employee_can_view_clientes(self, employee_token):
        """Employee can view clients (view_clients permission)"""
        response = requests.get(
            f"{BASE_URL}/api/clientes",
            headers={"Authorization": f"Bearer {employee_token}"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        clientes = response.json()
        assert isinstance(clientes, list)
        print(f"✓ Employee can view {len(clientes)} clientes")
    
    def test_employee_can_view_productos(self, employee_token):
        """Employee can view products (view_products permission)"""
        response = requests.get(
            f"{BASE_URL}/api/productos",
            headers={"Authorization": f"Bearer {employee_token}"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        productos = response.json()
        assert isinstance(productos, list)
        print(f"✓ Employee can view {len(productos)} productos")
    
    def test_employee_can_view_estilos(self, employee_token):
        """Employee can view styles (view_services permission)"""
        response = requests.get(
            f"{BASE_URL}/api/estilos",
            headers={"Authorization": f"Bearer {employee_token}"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        estilos = response.json()
        assert isinstance(estilos, list)
        print(f"✓ Employee can view {len(estilos)} estilos")
    
    def test_admin_can_view_clientes(self, admin_token):
        """Admin can view clients"""
        response = requests.get(
            f"{BASE_URL}/api/clientes",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        clientes = response.json()
        assert isinstance(clientes, list)
        print(f"✓ Admin can view {len(clientes)} clientes")
    
    def test_admin_can_view_productos(self, admin_token):
        """Admin can view products"""
        response = requests.get(
            f"{BASE_URL}/api/productos",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        productos = response.json()
        assert isinstance(productos, list)
        print(f"✓ Admin can view {len(productos)} productos")


class TestAuthorizationBoundaries:
    """Test RBAC authorization boundaries"""
    
    @pytest.fixture
    def owner_token(self):
        """Get owner authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json=OWNER_CREDENTIALS)
        if response.status_code != 200:
            pytest.skip("Owner login failed")
        return response.json()["access_token"]
    
    @pytest.fixture
    def employee_token(self):
        """Get employee authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json=EMPLOYEE_CREDENTIALS)
        if response.status_code != 200:
            pytest.skip("Employee login failed")
        return response.json()["access_token"]
    
    @pytest.fixture
    def admin_token(self):
        """Get admin sub-user authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json=ADMIN_CREDENTIALS)
        if response.status_code != 200:
            pytest.skip("Admin sub-user login failed")
        return response.json()["access_token"]
    
    def test_owner_is_only_one_who_can_manage_users(self, owner_token, admin_token, employee_token):
        """Only owner has manage_users permission to create/edit/delete users"""
        unique_email = f"test.boundary.{uuid.uuid4().hex[:8]}@test.nailcost.com"
        test_user = {
            "nombre": "TEST Boundary",
            "email": unique_email,
            "password": "TempPass123!",
            "role": "empleado"
        }
        
        # Owner can create
        owner_response = requests.post(
            f"{BASE_URL}/api/business/users",
            headers={"Authorization": f"Bearer {owner_token}"},
            json=test_user
        )
        assert owner_response.status_code == 200, "Owner should be able to create"
        created_id = owner_response.json()["id"]
        
        # Admin cannot create
        admin_response = requests.post(
            f"{BASE_URL}/api/business/users",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={**test_user, "email": f"admin.try.{uuid.uuid4().hex[:8]}@test.com"}
        )
        assert admin_response.status_code == 403, "Admin should NOT be able to create"
        
        # Employee cannot create
        employee_response = requests.post(
            f"{BASE_URL}/api/business/users",
            headers={"Authorization": f"Bearer {employee_token}"},
            json={**test_user, "email": f"emp.try.{uuid.uuid4().hex[:8]}@test.com"}
        )
        assert employee_response.status_code == 403, "Employee should NOT be able to create"
        
        # Cleanup
        requests.delete(
            f"{BASE_URL}/api/business/users/{created_id}",
            headers={"Authorization": f"Bearer {owner_token}"}
        )
        
        print("✓ Authorization boundaries verified: only owner can manage users")
    
    def test_admin_can_view_but_not_modify_users(self, admin_token, owner_token):
        """Admin can view users list but cannot modify"""
        # Admin can view
        list_response = requests.get(
            f"{BASE_URL}/api/business/users",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert list_response.status_code == 200, "Admin should be able to list users"
        
        users = list_response.json()
        if users:
            user_id = users[0]["id"]
            
            # Admin cannot update
            update_response = requests.put(
                f"{BASE_URL}/api/business/users/{user_id}",
                headers={"Authorization": f"Bearer {admin_token}"},
                json={"telefono": "SHOULD-FAIL"}
            )
            assert update_response.status_code == 403, "Admin should NOT be able to update"
            
            # Admin cannot delete
            delete_response = requests.delete(
                f"{BASE_URL}/api/business/users/{user_id}",
                headers={"Authorization": f"Bearer {admin_token}"}
            )
            assert delete_response.status_code == 403, "Admin should NOT be able to delete"
        
        print("✓ Admin can view but not modify users")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
