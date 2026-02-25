from InstanceApi import Client

class RegistrationClient(Client):
    def __init__(self):
        # self.__email = None
        # self.__description = None
        # self.__role = None
        self.__data = {}

    def set_data_field(self, field_name: str, value):
        self.__data[field_name] = value

    async def register_user(self, usr_id):
        self.__data["user_id"] = usr_id
        
        return await self.request("POST", "/register", json=self.__data)