# Handlers/employer_feed.py
from aiogram import Router, F, types
from aiogram.fsm.context import FSMContext

from Handlers.deps import api
from Handlers.guards import require_role
from Handlers.keyboards import kb_employer, ikey
import Handlers.pretty as pretty

router = Router()


@router.message(F.text == "🔎 Сотрудники")
async def employer_start(message: types.Message, state: FSMContext):
    if not await require_role(message, state, "organization"):
        return

    tg_id = message.from_user.id
    vacs = await api.get_my_vacancies(tg_id)
    if not vacs:
        await message.answer("У вас нет вакансий. Создайте через «➕ Создать вакансию».")
        return

    kb = types.InlineKeyboardMarkup(
        inline_keyboard=[
            [types.InlineKeyboardButton(
                text=f"#{v.get('id')} {v.get('position_title','Vacancy')}",
                callback_data=f"pickvac_{int(v.get('id'))}"
            )]
            for v in vacs if v.get("id") is not None
        ]
    )
    await message.answer("Выберите вакансию:", reply_markup=kb)


@router.callback_query(F.data.startswith("pickvac_"))
async def employer_pick_vac(callback: types.CallbackQuery, state: FSMContext):
    vacancy_id = int(callback.data.split("_", 1)[1])
    tg_id = callback.from_user.id

    recs = await api.get_recs_for_vacancy(tg_id, vacancy_id)
    if not recs:
        await callback.message.answer("Нет рекомендаций кандидатов по этой вакансии.")
        await callback.answer()
        return

    org = await api.get_org_me(tg_id)
    await state.update_data(
        org_id=int(org["id"]),
        e_vacancy_id=vacancy_id,
        e_recs=recs,
        e_idx=0,
        last_ctx_role="organization",
        last_ctx_vacancy_id=vacancy_id,
    )
    await show_candidate_card(callback.message, vacancy_id, recs[0])
    await callback.answer()


async def show_candidate_card(message: types.Message, vacancy_id: int, rec: dict):
    text = pretty.pretty_candidate_reco(rec)

    candidate_id = int(rec["entity_id"])  # скрываем, но используем для callback
    kb = types.InlineKeyboardMarkup(inline_keyboard=[[
        types.InlineKeyboardButton(text="❌", callback_data=f"cand_dislike_{vacancy_id}_{candidate_id}"),
        types.InlineKeyboardButton(text="❤️", callback_data=f"cand_like_{vacancy_id}_{candidate_id}"),
    ]])

    await message.answer(text, reply_markup=kb)


@router.callback_query(F.data.startswith("cand_"))
async def employer_react(callback: types.CallbackQuery, state: FSMContext):
    parts = callback.data.split("_")
    action = parts[1]
    vacancy_id = int(parts[2])
    candidate_id = int(parts[3])

    data = await state.get_data()
    org_id = int(data["org_id"])
    tg_id = callback.from_user.id

    r = await api.send_reaction(
        idempotency_key=ikey("org", str(tg_id), str(vacancy_id), str(candidate_id), action),
        payload={
            "initiator_entity_type": "organization",
            "initiator_entity_id": org_id,
            "target_entity_type": "candidate",
            "target_entity_id": candidate_id,
            "vacancy_id": vacancy_id,
            "action": action,
            "source": "telegram_bot",
        }
    )

    if isinstance(r, dict) and r.get("match_status") == "mutual_matched":
        match_id = r.get("match_id")
        if match_id:
            match = await api.get_match(int(match_id))
            await callback.message.answer(f"🎉 Взаимный мэтч!\n{match}")
        else:
            m = await api.get_match_by_context("organization", tg_id, vacancy_id)
            if m:
                await callback.message.answer(f"🎉 Взаимный мэтч!\n{m}")
    else:
        m = await api.get_match_by_context("organization", tg_id, vacancy_id)
        if m and m.get("status") == "mutual_matched":
            await callback.message.answer(f"🎉 Взаимный мэтч!\n{m}")
        else:
            await callback.message.answer("✅ Реакция отправлена. Ждём взаимный лайк.\nМожно позже нажать «🔄 Проверить мэтч».")

    recs = data.get("e_recs") or []
    idx = int(data.get("e_idx", 0)) + 1

    await state.update_data(last_ctx_role="organization", last_ctx_vacancy_id=vacancy_id)

    if idx < len(recs):
        await state.update_data(e_idx=idx)
        await show_candidate_card(callback.message, vacancy_id, recs[idx])
    else:
        await callback.message.answer("Конец списка кандидатов.", reply_markup=kb_employer())

    await callback.answer()