"""MongoDB indexes used by the production deployment.

Indexes are intentionally non-unique so legacy data cannot prevent startup.
They are safe to create repeatedly with Motor/MongoDB.
"""

from typing import Any


async def ensure_indexes(db: Any) -> None:
    collections = {
        "users": [("email", 1), ("account_status", 1), ("trial_ends_at", 1), ("subscription_ends_at", 1)],
        "business_users": [("email", 1), ("business_id", 1), ("activo", 1)],
        "productos": [("user_id", 1), ("nombre", 1)],
        "estilos": [("user_id", 1)],
        "disenos": [("user_id", 1)],
        "clientes": [("user_id", 1), ("email", 1)],
        "citas": [("user_id", 1), ("fecha", 1), ("hora", 1)],
        "servicios_realizados": [("user_id", 1), ("fecha", 1)],
        "facturas": [("user_id", 1), ("fecha", -1), ("numero", 1)],
        "inventario_movimientos": [("user_id", 1), ("producto_id", 1), ("fecha", -1)],
        "historial_calculos": [("user_id", 1), ("created_at", -1)],
        "password_resets": [("email", 1), ("token", 1), ("expires_at", 1)],
        "pagos": [("user_id", 1), ("created_at", -1), ("estado", 1)],
    }

    for collection_name, fields in collections.items():
        collection = db[collection_name]
        seen = set()
        for field, direction in fields:
            if field in seen:
                continue
            seen.add(field)
            try:
                await collection.create_index([(field, direction)])
            except Exception:
                # Indexes improve performance but must never prevent startup
                # when legacy data has an incompatible existing index.
                continue
