from typing import Any, Dict, Optional
from Api.Base.InstanceApi import Client


class ClientManager(Client):
    def __init__(self, base_url: str):
        super().__init__(base_url=base_url)
        self.__data: Dict[str, Any] = {}

    def clear_data(self):
        self.__data = {}

    def set_data_field(self, field_name: str, value: Any):
        self.__data[field_name] = value

    async def make_request(self, usr_id: int, reqType: str, apiTeg: str, *, token: Optional[str] = None):
        self.__data["user_id"] = usr_id
        return await self.request(reqType, apiTeg, token=token, json=self.__data)