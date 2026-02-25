from aiogram.fsm.state import StatesGroup, State


class BaseFSM(StatesGroup):
    VerReq = State()
    MailReq = State()
    GoWebPurpose = State()