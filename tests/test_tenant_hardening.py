from backend.production_app import TenantAwareUser


def test_business_subuser_resolves_data_id_to_business_owner():
    user = TenantAwareUser(
        {
            "id": "employee-123",
            "business_id": "business-456",
            "is_business_user": True,
            "business_role": "empleado",
        },
        "business-456",
    )

    assert user["id"] == "business-456"
    assert user.get("id") == "business-456"
    assert user["identity_id"] == "employee-123"
    assert user["effective_user_id"] == "business-456"
    assert user["business_id"] == "business-456"


def test_regular_user_identity_is_not_rewritten():
    user = TenantAwareUser(
        {
            "id": "user-123",
            "is_business_user": False,
        },
        "user-123",
    )

    assert user["id"] == "user-123"
    assert user.get("id") == "user-123"
    assert user["identity_id"] == "user-123"
