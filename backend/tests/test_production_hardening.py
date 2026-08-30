import os

os.environ.setdefault("MONGO_URL", "mongodb://localhost:27017")
os.environ.setdefault("DB_NAME", "stetik_test")
os.environ.setdefault("JWT_SECRET", "ci-only-secret-change-me")
os.environ.setdefault("CORS_ORIGINS", "http://localhost:3000")
os.environ.setdefault("STETIK_ALLOW_UNSUBSCRIBED_ACCESS", "false")

from backend.production_app import TenantAwareUser, _subscription_is_valid, _validate_invoice_payload


def test_subscription_accepts_active_trial():
    allowed, reason = _subscription_is_valid({
        "account_status": "active",
        "trial_ends_at": "2099-01-01T00:00:00+00:00",
        "subscription_ends_at": None,
        "role": "user",
    })
    assert allowed is True
    assert reason == "active_trial"


def test_subscription_rejects_expired_trial():
    allowed, reason = _subscription_is_valid({
        "account_status": "active",
        "trial_ends_at": "2020-01-01T00:00:00+00:00",
        "subscription_ends_at": None,
        "role": "user",
    })
    assert allowed is False
    assert reason == "Período de prueba vencido"


def test_pending_account_is_rejected_before_trial_check():
    allowed, reason = _subscription_is_valid({
        "account_status": "pending",
        "trial_ends_at": "2099-01-01T00:00:00+00:00",
        "role": "user",
    })
    assert allowed is False
    assert reason == "Cuenta no activa (pending)"


def test_invoice_validation_recalculates_subtotal_and_total():
    payload = {
        "items": [
            {"cantidad": 2, "precio_unitario": 10},
            {"cantidad": 1, "precio_unitario": 5},
        ],
        "subtotal": 25,
        "descuento": 5,
        "total": 20,
    }
    assert _validate_invoice_payload(payload) is None


def test_invoice_validation_rejects_tampered_total():
    payload = {
        "items": [{"cantidad": 2, "precio_unitario": 10}],
        "subtotal": 20,
        "descuento": 0,
        "total": 999,
    }
    assert _validate_invoice_payload(payload) == "El total no coincide con los items y el descuento"


def test_tenant_aware_user_preserves_identity_and_owner_id():
    user = TenantAwareUser({"id": "employee-1", "email": "employee@test.com"}, "business-1")
    assert user["id"] == "business-1"
    assert user["identity_id"] == "employee-1"
    assert user["effective_user_id"] == "business-1"
