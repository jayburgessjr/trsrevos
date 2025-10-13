from typing import Any, List, Mapping

from fastapi import APIRouter

from database import db

router = APIRouter(prefix="/clients", tags=["clients"])


@router.get("/list")
async def list_clients() -> List[dict]:
  records = await db.fetch_all(
    "SELECT id, name, industry, mrr FROM clients ORDER BY name ASC",
  )

  result: List[dict[str, Any]] = []

  for record in records:
    if isinstance(record, Mapping):
      result.append(
        {
          "id": str(record["id"]),
          "name": record["name"],
          "industry": record.get("industry"),
          "mrr": record.get("mrr"),
        },
      )
    else:
      client_id, name, industry, mrr = record
      result.append(
        {
          "id": str(client_id),
          "name": name,
          "industry": industry,
          "mrr": mrr,
        },
      )

  return result
