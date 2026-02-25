import httpx
import logging
from typing import Any, Dict, Optional


class Client:
    def __init__(self, base_url: str, timeout_s: float = 15.0):
        self.base_url = base_url.rstrip("/")
        self.timeout_s = timeout_s
        self.headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
        }

    async def request(
        self,
        method: str,
        endpoint: str,
        *,
        token: Optional[str] = None,
        extra_headers: Optional[Dict[str, str]] = None,
        params: Optional[Dict[str, Any]] = None,
        **kwargs,
    ):
        req_headers = dict(self.headers)
        if token:
            req_headers["Authorization"] = f"Bearer {token}"
        if extra_headers:
            req_headers.update(extra_headers)

        async with httpx.AsyncClient(base_url=self.base_url, headers=req_headers, timeout=self.timeout_s) as client:
            try:
                response = await client.request(method, endpoint, params=params, **kwargs)

                if response.status_code == 401:
                    logging.warning("401 Unauthorized: токен истек или невалиден")
                if response.status_code == 422:
                    logging.error(f"422 Validation error: {response.text}")

                response.raise_for_status()

                ct = (response.headers.get("content-type") or "").lower()
                if "application/json" in ct:
                    return response.json()
                return response.text

            except httpx.RequestError as e:
                logging.error(f"Connection Error: {e}")
                return None
            except httpx.HTTPStatusError as e:
                logging.error(f"HTTP Error {e.response.status_code} on {endpoint}: {e.response.text}")
                raise