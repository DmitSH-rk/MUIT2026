from aiogram.fsm.state import StatesGroup, State


class SearchFSM(StatesGroup):
    EndSearch = State()
    StartSearch = State()
    SearchQuery = State()
