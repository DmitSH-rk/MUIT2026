# import httpx
# import logging
# from typing import Optional
# import uuid

# class EmploymentAPI:
#     def __init__(self, base_url: str):
#         self.base_url = base_url
#         self.headers = {"Content-Type": "application/json", "Accept": "application/json"}

#     async def _request(
#         self,
#         method: str,
#         endpoint: str,
#         token: str = None,                 # можно оставить, но больше не обязателен
#         telegram_id: str = None,           # <-- НОВОЕ
#         headers: dict = None,
#         params: dict = None,
#         **kwargs
#     ):
#         req_headers = self.headers.copy()

#         # Старый путь (если всё-таки используешь токен)
#         if token:
#             req_headers["Authorization"] = f"Bearer {token}"

#         # Новый путь: telegram_id вместо токена
#         if telegram_id:
#             req_headers["X-Tg-User-Id"] = str(telegram_id)

#         if headers:
#             req_headers.update(headers)

#         async with httpx.AsyncClient(base_url=self.base_url, headers=req_headers, timeout=15.0) as client:
#             try:
#                 response = await client.request(method, endpoint, params=params, **kwargs)
#                 response.raise_for_status()
#                 return response.json()
#             except httpx.HTTPStatusError as e:
#                 logging.error(f"API Error: {e.response.status_code} - {e.response.text}")
#                 raise

#     # --- 1) Telegram pre-check ---
#     async def check_tg_user(self, telegram_id: str, username: str = None, first_name: str = None, last_name: str = None):
#         payload = {
#             "telegram_id": str(telegram_id),
#             "telegram_username": username,
#             "first_name": first_name,
#             "last_name": last_name
#         }
#         return await self._request("POST", "/employment/tg/check", json=payload)

#     # --- 2) Organizations ---
#     async def validate_org_email(self, email: str):
#         return await self._request("POST", "/employment/organizations/validate-email", json={"email": email})

#     async def register_org(self, payload: dict):
#         return await self._request("POST", "/employment/organizations/register", json=payload)

#     async def get_org_me(self, telegram_id: str):
#         return await self._request("GET", "/employment/organizations/me", telegram_id=telegram_id)

#     # --- 3) Candidates ---
#     async def register_candidate(self, payload: dict):
#         return await self._request("POST", "/employment/candidates/register", json=payload)

#     async def get_candidate_me(self, telegram_id: str):
#         return await self._request("GET", "/employment/candidates/me", telegram_id=telegram_id)

#     async def update_candidate(self, telegram_id: str, payload: dict):
#         return await self._request("PATCH", "/employment/candidates/me", telegram_id=telegram_id, json=payload)

#     async def get_candidate_history(self, telegram_id: str, version: int = None):
#         url = f"/employment/candidates/me/history{f'/{version}' if version else ''}"
#         return await self._request("GET", url, telegram_id=telegram_id)

#     # --- 4) Vacancies ---
#     async def create_vacancy(self, telegram_id: str, payload: dict):
#         return await self._request("POST", "/employment/vacancies", telegram_id=telegram_id, json=payload)

#     async def get_my_vacancies(self, telegram_id: str):
#         return await self._request("GET", "/employment/vacancies/my", telegram_id=telegram_id)

#     async def get_vacancy(self, vac_id: int):
#         return await self._request("GET", f"/employment/vacancies/{vac_id}")

#     async def update_vacancy(self, telegram_id: str, vac_id: int, payload: dict):
#         return await self._request("PATCH", f"/employment/vacancies/{vac_id}", telegram_id=telegram_id, json=payload)

#     async def update_vacancy_status(self, telegram_id: str, vac_id: int, status: str):
#         return await self._request("PATCH", f"/employment/vacancies/{vac_id}/status", telegram_id=telegram_id, json={"status": status})

#     # --- 5) Matching & Recs ---
#     async def get_recs_for_candidate(self, telegram_id: str):
#         return await self._request("GET", "/employment/recommendations/vacancies-for-candidate", telegram_id=telegram_id)

#     async def get_recs_for_vacancy(self, telegram_id: str, vac_id: int):
#         return await self._request("GET", f"/employment/vacancies/{vac_id}/recommended-candidates", telegram_id=telegram_id)

#     # --- 6) Reactions & Matches ---
#     async def send_reaction(self, ikey: str, payload: dict):
#         # reactions по доке требуют Idempotency-Key :contentReference[oaicite:3]{index=3}
#         return await self._request("POST", "/employment/reactions", headers={"Idempotency-Key": ikey}, json=payload)

#     async def get_matches(self, c_id: int = None, o_id: int = None):
#         params = {k: v for k, v in [("candidate_id", c_id), ("organization_id", o_id)] if v}
#         return await self._request("GET", "/employment/matches", params=params)
    
#     async def send_reaction_by_context(self, role: str, telegram_id: str, vacancy_id: int, action: str, ikey: str | None = None):
#         """
#         POST /employment/reactions/by-context
#         Body: {role, telegram_id, vacancy_id, action}
#         Header: Idempotency-Key
#         """
#         if ikey is None:
#             ikey = str(uuid.uuid4())

#         payload = {
#             "role": role,  # candidate | organization
#             "telegram_id": str(telegram_id),
#             "vacancy_id": int(vacancy_id),
#             "action": action,  # like | dislike
#         }
#         return await self._request(
#             "POST",
#             "/employment/reactions/by-context",
#             headers={"Idempotency-Key": ikey},
#             json=payload,
#         )

#     async def get_match_by_context(self, role: str, tg_user_id: str, vacancy_id: int):
#         """
#         POST /employment/matches/by-context
#         404 = матч не найден (это нормально)
#         """
#         payload = {
#             "role": role,
#             "tg_user_id": str(tg_user_id),
#             "vacancy_id": int(vacancy_id),
#         }
#         try:
#             return await self._request("POST", "/employment/matches/by-context", json=payload)
#         except httpx.HTTPStatusError as e:
#             if e.response.status_code == 404:
#                 return None
#             raise

#     async def update_match_status_by_context(self, role: str, tg_user_id: str, vacancy_id: int, status: str):
#         """
#         PATCH /employment/matches/status-by-context
#         """
#         payload = {
#             "role": role,
#             "tg_user_id": str(tg_user_id),
#             "vacancy_id": int(vacancy_id),
#             "status": status,
#         }
#         return await self._request("PATCH", "/employment/matches/status-by-context", json=payload)

#     async def get_match(self, match_id: int):
#         """
#         GET /employment/matches/{match_id}
#         """
#         return await self._request("GET", f"/employment/matches/{int(match_id)}")


import uuid
import httpx
import logging
from typing import Any, Dict, Optional


class EmploymentAPI:
    def __init__(self, base_url: str):
        self.base_url = base_url.rstrip("/")
        self.base_headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
        }

    async def _request(
        self,
        method: str,
        endpoint: str,
        *,
        telegram_id: Optional[str | int] = None,   # <-- главный “контекст”
        headers: Optional[Dict[str, str]] = None,
        params: Optional[Dict[str, Any]] = None,
        **kwargs,
    ):
        req_headers = dict(self.base_headers)

        # ВАЖНО: реальный сервер требует именно это имя заголовка
        if telegram_id is not None:
            req_headers["X-Tg-User-Id"] = str(telegram_id)

        if headers:
            req_headers.update(headers)

        async with httpx.AsyncClient(
            base_url=self.base_url,
            headers=req_headers,
            timeout=15.0,
        ) as client:
            try:
                resp = await client.request(method, endpoint, params=params, **kwargs)
                resp.raise_for_status()

                ct = (resp.headers.get("content-type") or "").lower()
                if "application/json" in ct:
                    return resp.json()
                return resp.text

            except httpx.HTTPStatusError as e:
                logging.error(f"API Error: {e.response.status_code} - {e.response.text}")
                raise

    # -----------------------------
    # Telegram pre-check (public)
    # -----------------------------
    async def check_tg_user(self, telegram_id: str, username: str = None, first_name: str = None, last_name: str = None):
        payload = {
            "telegram_id": str(telegram_id),
            "telegram_username": username,
            "first_name": first_name,
            "last_name": last_name,
        }
        return await self._request("POST", "/employment/tg/check", json=payload)

    # -----------------------------
    # Organizations
    # -----------------------------
    async def register_org(self, payload: Dict[str, Any]):
        return await self._request("POST", "/employment/organizations/register", json=payload)

    async def get_org_me(self, telegram_id: str | int):
        return await self._request("GET", "/employment/organizations/me", telegram_id=telegram_id)

    # -----------------------------
    # Candidates
    # -----------------------------
    async def register_candidate(self, payload: Dict[str, Any]):
        return await self._request("POST", "/employment/candidates/register", json=payload)

    async def get_candidate_me(self, telegram_id: str | int):
        return await self._request("GET", "/employment/candidates/me", telegram_id=telegram_id)

    # -----------------------------
    # Vacancies
    # -----------------------------
    async def create_vacancy(self, telegram_id: str | int, payload: Dict[str, Any]):
        return await self._request("POST", "/employment/vacancies", telegram_id=telegram_id, json=payload)

    async def get_my_vacancies(self, telegram_id: str | int):
        return await self._request("GET", "/employment/vacancies/my", telegram_id=telegram_id)

    async def get_vacancy(self, vacancy_id: int):
        return await self._request("GET", f"/employment/vacancies/{int(vacancy_id)}")

    # -----------------------------
    # Recommendations
    # -----------------------------
    async def get_recs_for_candidate(self, telegram_id: str | int):
        return await self._request("GET", "/employment/recommendations/vacancies-for-candidate", telegram_id=telegram_id)

    async def get_recs_for_vacancy(self, telegram_id: str | int, vacancy_id: int):
        return await self._request("GET", f"/employment/vacancies/{int(vacancy_id)}/recommended-candidates", telegram_id=telegram_id)

    # -----------------------------
    # Reactions
    # -----------------------------
    async def send_reaction(self, idempotency_key: str, payload: Dict[str, Any]):
        return await self._request(
            "POST",
            "/employment/reactions",
            headers={"Idempotency-Key": idempotency_key},
            json=payload,
        )

    async def send_reaction_by_context(
        self,
        role: str,
        telegram_id: str | int,
        vacancy_id: int,
        action: str,
        idempotency_key: Optional[str] = None,
    ):
        if idempotency_key is None:
            idempotency_key = str(uuid.uuid4())

        payload = {
            "role": role,                  # candidate | organization
            "telegram_id": str(telegram_id),
            "vacancy_id": int(vacancy_id),
            "action": action,              # like | dislike
        }
        return await self._request(
            "POST",
            "/employment/reactions/by-context",
            headers={"Idempotency-Key": idempotency_key},
            json=payload,
        )

    # -----------------------------
    # Matches
    # -----------------------------
    async def get_match(self, match_id: int):
        return await self._request("GET", f"/employment/matches/{int(match_id)}")

    async def get_match_by_context(self, role: str, tg_user_id: str | int, vacancy_id: int):
        payload = {
            "role": role,
            "tg_user_id": str(tg_user_id),
            "vacancy_id": int(vacancy_id),
        }
        try:
            return await self._request("POST", "/employment/matches/by-context", json=payload)
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 404:
                return None
            raise