from IParser import BaseConfigurator, RegSchema
from pydantic import BaseModel

class RegSchema(BaseModel):
    welcome: str
    role_chosen: str
    btn_admin: str
    btn_user: str

class RegInterface(BaseConfigurator[RegSchema]):
    def __init__(self):
        # Передаем имя своего файла и свою схему
        super().__init__("registration.json", RegSchema)

    # Конкретные геттеры для этого интерфейса
    @property
    def welcome_text(self) -> str:
        return self.content.welcome

    @property
    def admin_btn(self) -> str:
        return self.content.btn_admin

    def get_success_msg(self, role: str) -> str:
        return self.content.role_chosen.format(role=role)