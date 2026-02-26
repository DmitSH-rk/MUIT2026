# Handlers/match.py
from aiogram import Router, F, types
from aiogram.fsm.context import FSMContext

from Handlers.deps import api
import Handlers.pretty as pretty

router = Router()


@router.message(F.text == "🔄 Проверить мэтч")
async def check_match(message: types.Message, state: FSMContext):
    data = await state.get_data()
    role = data.get("last_ctx_role")
    vacancy_id = data.get("last_ctx_vacancy_id")
    tg_id = message.from_user.id

    if not role or not vacancy_id:
        await message.answer("Нет контекста. Сначала поставь лайк/дизлайк в ленте.")
        return

    m = await api.get_match_by_context(role, tg_id, int(vacancy_id))
    if not m:
        await message.answer("Пока матча нет.")
        return

    await message.answer(pretty.pretty_match(m))