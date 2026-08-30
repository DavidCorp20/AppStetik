from backend.production_app import _build_user_response


def test_auth_me_preserves_trial_and_subscription_fields():
    response = _build_user_response({
        "id": "user-1",
        "email": "user@example.com",
        "nombre": "Carla",
        "nombre_negocio": "Asuncion",
        "telefono": "123",
        "plan": "free",
        "role": "user",
        "user_type": "personal",
        "created_at": "2026-08-30T00:00:00+00:00",
        "account_status": "active",
        "trial_ends_at": "2026-09-14T00:00:00+00:00",
        "subscription_starts_at": None,
        "subscription_ends_at": None,
    })
    assert response.id == "user-1"
    assert response.account_status == "active"
    assert response.trial_ends_at == "2026-09-14T00:00:00+00:00"


def test_auth_me_uses_subuser_identity_not_business_owner():
    response = _build_user_response({
        "id": "business-owner",
        "identity_id": "employee-1",
        "email": "employee@example.com",
        "nombre": "Empleado",
        "nombre_negocio": "Asuncion",
        "telefono": "123",
        "plan": "premium",
        "role": "empleado",
        "user_type": "business",
        "created_at": "2026-08-30T00:00:00+00:00",
        "account_status": "active",
        "trial_ends_at": None,
        "subscription_starts_at": "2026-08-01T00:00:00+00:00",
        "subscription_ends_at": "2026-09-01T00:00:00+00:00",
    })
    assert response.id == "employee-1"
    assert response.role == "empleado"
    assert response.plan == "premium"
