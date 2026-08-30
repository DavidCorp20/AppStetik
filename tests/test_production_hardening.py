import os
from datetime import datetime, timedelta, timezone

from backend.production_app import _subscription_is_valid


def _future(days=1):
    return (datetime.now(timezone.utc) + timedelta(days=days)).isoformat()


def _past(days=1):
    return (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()


def test_active_trial_is_allowed():
    ok, reason = _subscription_is_valid({"account_status": "active", "trial_ends_at": _future()})
    assert ok is True
    assert reason == "active_trial"


def test_expired_trial_is_blocked():
    ok, reason = _subscription_is_valid({"account_status": "active", "trial_ends_at": _past()})
    assert ok is False
    assert reason == "Período de prueba vencido"


def test_active_subscription_has_priority_over_expired_trial():
    ok, reason = _subscription_is_valid({
        "account_status": "active",
        "trial_ends_at": _past(),
        "subscription_ends_at": _future(),
    })
    assert ok is True
    assert reason == "active_subscription"


def test_expired_subscription_is_blocked():
    ok, reason = _subscription_is_valid({"account_status": "active", "subscription_ends_at": _past()})
    assert ok is False
    assert reason == "Suscripción vencida"


def test_pending_account_is_blocked_even_with_future_trial():
    ok, reason = _subscription_is_valid({"account_status": "pending", "trial_ends_at": _future()})
    assert ok is False
    assert "pending" in reason


def test_suspended_account_is_blocked():
    ok, reason = _subscription_is_valid({"account_status": "suspended", "subscription_ends_at": _future()})
    assert ok is False
    assert "suspended" in reason


def test_admin_is_allowed_without_subscription():
    ok, reason = _subscription_is_valid({"role": "admin", "account_status": "active"})
    assert ok is True
    assert reason == "admin"


def test_legacy_access_requires_explicit_flag(monkeypatch):
    monkeypatch.setenv("STETIK_ALLOW_UNSUBSCRIBED_ACCESS", "true")
    ok, reason = _subscription_is_valid({"account_status": "active", "plan": "free"})
    assert ok is True
    assert reason == "legacy_access"
    monkeypatch.delenv("STETIK_ALLOW_UNSUBSCRIBED_ACCESS", raising=False)
