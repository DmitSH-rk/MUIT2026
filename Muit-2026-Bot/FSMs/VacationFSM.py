from aiogram.fsm.state import StatesGroup, State


class VacationCreateFSM(StatesGroup):
    VacRoleSearch = State()
    VacDesc = State()
    VacSkills = State()


class VacationListFSM(StatesGroup):
    VacGetList = State()
    VacShowNext = State()
    VacDelete = State()
    VacReadFull = State()