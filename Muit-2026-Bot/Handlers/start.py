# Handlers/start.py
from aiogram import Router, F, types
from aiogram.filters import CommandStart
from aiogram.fsm.context import FSMContext

from FSMs.RegistrationFSM import RegistrationFSM
from Handlers.deps import api
from Handlers.keyboards import kb_candidate, kb_employer, role_pick_kb
from Handlers.role import detect_roles, set_active_role

router = Router()


@router.message(CommandStart())
@router.message(F.text == "START")
async def cmd_start(message: types.Message, state: FSMContext):
    await state.clear()

    tg_id = message.from_user.id
    check = await api.check_tg_user(
        telegram_id=str(tg_id),
        username=message.from_user.username,
        first_name=message.from_user.first_name,
        last_name=message.from_user.last_name,
    )
    if check is None:
        await message.answer("⚠️ Сервер временно недоступен. Попробуйте позже.")
        return

    if check.get("is_blocked"):
        await message.answer("⛔ Ваш аккаунт заблокирован.")
        return

    if not check.get("is_linked"):
        await message.answer("Привет! Ты еще не зарегистрирован. Введи свой Email:")
        await state.set_state(RegistrationFSM.RegEmail)
        return

    is_cand, is_org = await detect_roles(tg_id)

    if is_cand and is_org:
        await message.answer("У тебя есть и кандидат, и компания. Выбери режим:", reply_markup=role_pick_kb())
        return

    if is_org:
        await set_active_role(state, "organization")
        await message.answer("Ок, режим компании.", reply_markup=kb_employer())
        return

    if is_cand:
        await set_active_role(state, "candidate")
        await message.answer("Ок, режим кандидата.", reply_markup=kb_candidate())
        return

    await message.answer("Профиль не найден. Давай зарегистрируемся. Введи Email:")
    await state.set_state(RegistrationFSM.RegEmail)


@router.callback_query(F.data.startswith("setrole_"))
async def set_role_callback(callback: types.CallbackQuery, state: FSMContext):
    role = callback.data.split("_", 1)[1]
    await set_active_role(state, role)

    if role == "organization":
        await callback.message.answer("Ок, режим компании.", reply_markup=kb_employer())
    else:
        await callback.message.answer("Ок, режим кандидата.", reply_markup=kb_candidate())

    await callback.answer()