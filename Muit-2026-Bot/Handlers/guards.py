# Handlers/guards.py
from aiogram.fsm.context import FSMContext
from aiogram import types
from Handlers.role import detect_roles, get_active_role, set_active_role


async def require_role(message: types.Message, state: FSMContext, role: str) -> bool:
    active = await get_active_role(state)
    if active == role:
        return True

    tg_id = message.from_user.id
    is_cand, is_org = await detect_roles(tg_id)

    if role == "candidate" and is_cand and not is_org:
        await set_active_role(state, "candidate")
        return True

    if role == "organization" and is_org and not is_cand:
        await set_active_role(state, "organization")
        return True

    await message.answer("Эта функция недоступна в текущем режиме. Нажми /start и выбери роль.")
    return False