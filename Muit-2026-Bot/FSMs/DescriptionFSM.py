from aiogram.fsm.state import StatesGroup, State


class DescriptionFSM(StatesGroup):
    EmployDesc = State()
    VacationDesc = State()