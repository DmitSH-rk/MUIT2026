from aiogram.fsm.state import StatesGroup, State


class RegistrationFSM(StatesGroup):
    RegName = State()
    RegEmail = State()
    RegPassword = State()
    RegCity = State()
    RegRole = State()
    RegDesc = State()
    RegLinks = State()