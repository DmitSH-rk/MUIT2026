# Handlers/profile.py
from aiogram import Router, F, types
from aiogram.fsm.context import FSMContext

from Handlers.deps import api
from Handlers.role import get_active_role
import Handlers.pretty as pretty

router = Router()


@router.message(F.text == "👤 Профиль")
async def my_profile(message: types.Message, state: FSMContext):
    role = await get_active_role(state)
    tg_id = message.from_user.id

    if role == "organization":
        me = await api.get_org_me(tg_id)
        await message.answer(pretty.pretty_org_profile(me))
        return

    if role == "candidate":
        me = await api.get_candidate_me(tg_id)
        await message.answer(pretty.pretty_candidate_profile(me))
        return

    await message.answer("Роль не выбрана. Нажми /start.")