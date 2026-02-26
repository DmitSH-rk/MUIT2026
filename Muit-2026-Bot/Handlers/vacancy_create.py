# Handlers/vacancy_create.py
from aiogram import Router, F, types
from aiogram.filters import Command
from aiogram.fsm.context import FSMContext

from FSMs.VacationFSM import VacationCreateFSM
from FSMs.ExpirienceFSM import ExperienceInfoFSM

from Handlers.deps import api
from Handlers.guards import require_role
from Handlers.keyboards import kb_employer
from Handlers.role import set_active_role

router = Router()


@router.message(F.text == "➕ Создать вакансию")
@router.message(Command("new_job"))
async def vac_start(message: types.Message, state: FSMContext):
    if not await require_role(message, state, "organization"):
        return
    await message.answer("Название позиции:")
    await state.set_state(VacationCreateFSM.VacRoleSearch)


@router.message(VacationCreateFSM.VacRoleSearch)
async def vac_role(message: types.Message, state: FSMContext):
    await state.update_data(v_role=(message.text or "").strip())
    await message.answer("Требуемый опыт (число лет):")
    await state.set_state(ExperienceInfoFSM.ExperienceInfoVac)


@router.message(ExperienceInfoFSM.ExperienceInfoVac)
async def vac_exp(message: types.Message, state: FSMContext):
    await state.update_data(v_exp=(message.text or "").strip())
    await message.answer("Описание вакансии:")
    await state.set_state(VacationCreateFSM.VacDesc)


@router.message(VacationCreateFSM.VacDesc)
async def vac_finish(message: types.Message, state: FSMContext):
    if not await require_role(message, state, "organization"):
        return

    tg_id = message.from_user.id
    data = await state.get_data()

    await api.create_vacancy(
        telegram_id=tg_id,
        payload={
            "position_title": data.get("v_role"),
            "description_json": {"text": (message.text or "").strip(), "exp": data.get("v_exp")},
            "city": data.get("city", "Remote"),
        }
    )

    await message.answer("✅ Вакансия опубликована.", reply_markup=kb_employer())
    await state.clear()
    await set_active_role(state, "organization")