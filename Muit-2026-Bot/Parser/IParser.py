import json
from pathlib import Path
from pydantic import BaseModel
from typing import Type, TypeVar, Generic

# Тип для схем Pydantic
SchemaT = TypeVar("SchemaT", bound=BaseModel)

class BaseConfigurator(Generic[SchemaT]):
    """Базовый класс, который умеет только читать свой JSON в свою схему"""
    def __init__(self, file_name: str, schema: Type[SchemaT]):
        self.file_path = Path(__file__).parent / "locales" / file_name
        self.schema = schema
        self.content: SchemaT = self.load()

    def load(self) -> SchemaT:
        if not self.file_path.exists():
            raise FileNotFoundError(f"Конфиг {self.file_path} не найден!")
        with open(self.file_path, "r", encoding="utf-8") as f:
            return self.schema.model_validate(json.load(f))
    
    def reload(self):
        self.content = self.load()