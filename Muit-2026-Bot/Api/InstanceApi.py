import httpx
import logging

class Client:
    def __init__(self, base_url: str, token: str = None):
        self.base_url = base_url
        self.headers = {
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
        # if token:
        #     self.headers["Authorization"] = f"Bearer {token}"

    async def request(self, method: str, endpoint: str, **kwargs):
        async with httpx.AsyncClient(base_url=self.base_url, headers=self.headers) as client:
            try:
                response = await client.request(method, endpoint, **kwargs)
                
                # Аналог interceptor response (обработка ошибок)
                if response.status_code == 401:
                    logging.warning("Токен истек или невалиден")
                    # Тут можно вызвать логику логаута или обновления токена
                    
                if response.status_code == 422:
                    logging.error(f"Ошибка валидации FastAPI: {response.json()}")

                response.raise_for_status()
                return response.json()
            except httpx.HTTPStatusError as e:
                logging.error(f"HTTP Error {e.response.status_code} on {endpoint}")
                raise
            except Exception as e:
                logging.error(f"Connection Error: {e}")
                raise