import json
import os
from typing import Any, Mapping, Sequence

import asyncpg


class Database:
  def __init__(self) -> None:
    self._pool: asyncpg.Pool | None = None

  async def _get_pool(self) -> asyncpg.Pool:
    if self._pool is None:
      dsn = os.getenv("DATABASE_URL")
      if not dsn:
        raise RuntimeError("DATABASE_URL environment variable is required for database access")
      self._pool = await asyncpg.create_pool(dsn, command_timeout=60)
    return self._pool

  async def fetch_all(
    self,
    query: str,
    params: Mapping[str, Any] | None = None,
  ) -> Sequence[Mapping[str, Any]]:
    pool = await self._get_pool()
    async with pool.acquire() as connection:
      statement = await connection.prepare(query)
      return await statement.fetch(**(params or {}))

  async def fetch_one(
    self,
    query: str,
    params: Mapping[str, Any] | None = None,
  ) -> Mapping[str, Any] | None:
    rows = await self.fetch_all(query, params)
    return rows[0] if rows else None

  async def insert(
    self,
    table: str,
    values: Mapping[str, Any],
  ) -> Mapping[str, Any]:
    columns = list(values.keys())
    placeholders = ", ".join(f"${index}" for index in range(1, len(columns) + 1))
    query = f"INSERT INTO {table} ({', '.join(columns)}) VALUES ({placeholders}) RETURNING *"

    payload: list[Any] = []
    for column in columns:
      value = values[column]
      if isinstance(value, (dict, list)):
        payload.append(json.dumps(value))
      else:
        payload.append(value)

    pool = await self._get_pool()
    async with pool.acquire() as connection:
      return await connection.fetchrow(query, *payload)


db = Database()
