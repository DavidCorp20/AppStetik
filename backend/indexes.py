"""MongoDB indexes used by the production deployment.

Indexes are intentionally non-unique so legacy data cannot prevent startup.
They are safe to create repeatedly with Motor/MongoDB.
"""

from typing import Any


async def ensure_indexes(db: Any) -> None:
    collections = {
        "users": [("email", 1)],
        "business_users": [("email", 1), ("business_id", 1), ("business_id", 1), ("activo", 1)],
        "productos": [("user_id", 1), ("user_id", 1), ("nombre", 1)],
        "estilos": [("user_id", 1)],
        "disenos": [("user_id", 1)],
        "clientes": [("user_id", 1), ("email", 1)],
        "citas": [("user_id", 1), ("fecha", 1), ("hora", 1)],
        "servicios": [("user_id", 1), ("fecha", 1)],
        "facturas": [("user_id", 1), ("fecha", -1), ("numero", 1)],
        "movimientos_inventario": [("user_id", 1), ("producto_id", 1), ("fecha", -1)],
        "calculation_history": [("user_id", 1), ("created_at", -1)],
        "password_resets": [("email", 1), ("expires_at", 1)],
    }

    for collection_name, fields in collections.items():
        collection = db[collection_name]
        # De-duplicate field definitions while preserving order.
        seen = set()
        for field, direction in fields:
            if field in seen:
                continue
            seen.add(field)
            try:
                await collection.create_index([(field, direction)])
            except Exception:
                # An index should improve performance, never prevent the API
                # from starting when legacy data has an incompatible index.
                continue
