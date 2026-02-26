# Handlers/candidate_feed.py
from aiogram import Router, F, types
from aiogram.fsm.context import FSMContext

from Handlers.deps import api
from Handlers.guards import require_role
from Handlers.keyboards import kb_candidate, ikey
import Handlers.pretty as pretty

router = Router()


@router.message(F.text == "🔍 Вакансии")
async def candidate_feed(message: types.Message, state: FSMContext):
    if not await require_role(message, state, "candidate"):
        return

    tg_id = message.from_user.id
    recs = await api.get_recs_for_candidate(tg_id)
    if not recs:
        await message.answer("Пока нет рекомендаций вакансий.")
        return

    await state.update_data(
        c_recs=recs,
        c_idx=0,
        last_ctx_role="candidate",
        last_ctx_vacancy_id=int(recs[0]["entity_id"]),
    )
    await show_vacancy_card(message, recs[0])


async def show_vacancy_card(message: types.Message, rec: dict):
    try:
        vacancy_id = int(rec.get("entity_id"))
    except Exception:
        await message.answer("⚠️ Не удалось определить vacancy_id из рекомендации.")
        return

    try:
        vac = await api.get_vacancy(vacancy_id)
    except Exception as e:
        await message.answer(f"⚠️ Не удалось загрузить вакансию #{vacancy_id}: {e}")
        return

    if not isinstance(vac, dict):
        await message.answer(f"⚠️ Вакансия #{vacancy_id} вернулась в неожиданном формате.")
        return

    match_pct = rec.get("match_percent_display") or rec.get("match_percent") or "—"
    conf = rec.get("confidence")

    title = vac.get("position_title") or "Вакансия"
    city = vac.get("city") or "—"
    is_remote = vac.get("is_remote")
    status = vac.get("status") or "—"
    employment_type = vac.get("employment_type") or "—"

    text, exp = pretty._fmt_description_json(vac.get("description_json"))

    lines = []
    lines.append(f"🧾 {title}")
    lines.append(f"📌 Vacancy ID: {vacancy_id}")
    lines.append(f"📊 Match: {match_pct}%  {pretty._confidence_emoji(conf)} {conf or '—'}")
    lines.append(f"🏙 Город: {city}")
    lines.append(f"🌐 Удалёнка: {pretty._fmt_bool(is_remote)}")
    lines.append(f"🧩 Тип занятости: {employment_type}")
    lines.append(f"{pretty._status_emoji(status)} Статус: {status}")
    if exp:
        lines.append(f"🧠 Опыт: {exp}")
    if text:
        lines.append(f"📝 Описание: {pretty._trunc(text, 260)}")

    kb = types.InlineKeyboardMarkup(inline_keyboard=[[
        types.InlineKeyboardButton(text="❌", callback_data=f"vac_dislike_{vacancy_id}"),
        types.InlineKeyboardButton(text="❤️", callback_data=f"vac_like_{vacancy_id}"),
    ]])

    await message.answer("\n".join(lines), reply_markup=kb, disable_web_page_preview=True)


@router.callback_query(F.data.startswith("vac_"))
async def candidate_react(callback: types.CallbackQuery, state: FSMContext):
    _, action, vacancy_id_str = callback.data.split("_", 2)
    vacancy_id = int(vacancy_id_str)
    tg_id = callback.from_user.id

    r = await api.send_reaction_by_context(
        role="candidate",
        telegram_id=tg_id,
        vacancy_id=vacancy_id,
        action=action,
        idempotency_key=ikey("candidate", str(tg_id), str(vacancy_id), action),
    )

    if isinstance(r, dict) and r.get("match_status") == "mutual_matched":
        match_id = r.get("match_id")
        if match_id:
            match = await api.get_match(int(match_id))
            await callback.message.answer(f"🎉 Взаимный мэтч!\n{match}")
        else:
            m = await api.get_match_by_context("candidate", tg_id, vacancy_id)
            if m:
                await callback.message.answer(f"🎉 Взаимный мэтч!\n{m}")
    else:
        m = await api.get_match_by_context("candidate", tg_id, vacancy_id)
        if m and m.get("status") == "mutual_matched":
            await callback.message.answer(f"🎉 Взаимный мэтч!\n{m}")
        else:
            await callback.message.answer("✅ Реакция отправлена. Ждём взаимный лайк.\nМожно позже нажать «🔄 Проверить мэтч».")

    data = await state.get_data()
    recs = data.get("c_recs") or []
    idx = int(data.get("c_idx", 0)) + 1

    await state.update_data(last_ctx_role="candidate", last_ctx_vacancy_id=vacancy_id)

    if idx < len(recs):
        await state.update_data(c_idx=idx, last_ctx_vacancy_id=int(recs[idx]["entity_id"]))
        await show_vacancy_card(callback.message, recs[idx])
    else:
        await callback.message.answer("Конец списка вакансий.", reply_markup=kb_candidate())

    await callback.answer()