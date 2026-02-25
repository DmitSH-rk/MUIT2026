import uuid
from aiogram import Router, F, types
from aiogram.filters import CommandStart, Command
from aiogram.fsm.context import FSMContext
import json
from FSMs.RegistrationFSM import RegistrationFSM
from FSMs.DescriptionFSM import DescriptionFSM
from FSMs.SkillsFSM import SkillsFSM
from FSMs.VacationFSM import VacationCreateFSM
from FSMs.ExpirienceFSM import ExperienceInfoFSM
import Handlers.pretty as pretty
from Api.UserApi.EmployeeApi import EmploymentAPI

router = Router()
api = EmploymentAPI("http://2.132.157.33:8000")


# -----------------------------
# Keyboards
# -----------------------------
def kb_candidate() -> types.ReplyKeyboardMarkup:
    return types.ReplyKeyboardMarkup(
        keyboard=[
            [types.KeyboardButton(text="🔍 Вакансии")],
            [types.KeyboardButton(text="🔄 Проверить мэтч")],
            [types.KeyboardButton(text="👤 Профиль")],
        ],
        resize_keyboard=True,
    )


def kb_employer() -> types.ReplyKeyboardMarkup:
    return types.ReplyKeyboardMarkup(
        keyboard=[
            [types.KeyboardButton(text="🔎 Сотрудники")],
            [types.KeyboardButton(text="➕ Создать вакансию")],
            [types.KeyboardButton(text="📋 Мои вакансии")],
            [types.KeyboardButton(text="🔄 Проверить мэтч")],
            [types.KeyboardButton(text="👤 Профиль")],
        ],
        resize_keyboard=True,
    )


def role_pick_kb() -> types.InlineKeyboardMarkup:
    return types.InlineKeyboardMarkup(inline_keyboard=[[
        types.InlineKeyboardButton(text="Режим кандидата", callback_data="setrole_candidate"),
        types.InlineKeyboardButton(text="Режим компании", callback_data="setrole_organization"),
    ]])


def ikey(*parts: str) -> str:
    # стабильный ключ для идемпотентности
    return "tg:" + ":".join(parts)


# -----------------------------
# Role detection
# -----------------------------
async def detect_roles(tg_id: int) -> tuple[bool, bool]:
    is_candidate = False
    is_org = False

    try:
        me_c = await api.get_candidate_me(tg_id)
        if isinstance(me_c, dict) and me_c.get("id") is not None:
            is_candidate = True
    except Exception:
        pass

    try:
        me_o = await api.get_org_me(tg_id)
        if isinstance(me_o, dict) and me_o.get("id") is not None:
            is_org = True
    except Exception:
        pass

    return is_candidate, is_org


async def get_active_role(state: FSMContext) -> str | None:
    data = await state.get_data()
    return data.get("active_role")


async def set_active_role(state: FSMContext, role: str):
    await state.update_data(active_role=role)


# -----------------------------
# Start
# -----------------------------
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

    # linked: авто-роль
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

    # linked, но профиля нет (странный кейс)
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


# -----------------------------
# Registration
# -----------------------------
@router.message(RegistrationFSM.RegEmail)
async def reg_email(message: types.Message, state: FSMContext):
    email = (message.text or "").strip()
    if "@" not in email:
        await message.answer("Некорректный email. Введите ещё раз:")
        return

    await state.update_data(email=email)

    kb = types.ReplyKeyboardMarkup(
        keyboard=[[types.KeyboardButton(text="👨‍💻 Соискатель"), types.KeyboardButton(text="🏢 Компания")]],
        resize_keyboard=True,
        one_time_keyboard=True,
    )
    await message.answer("Выберите вашу роль:", reply_markup=kb)
    await state.set_state(RegistrationFSM.RegRole)


@router.message(RegistrationFSM.RegRole)
async def reg_role(message: types.Message, state: FSMContext):
    txt = message.text or ""
    if "Соискатель" in txt:
        await state.update_data(role="candidate")
        await message.answer("Ваше имя (ФИО):", reply_markup=types.ReplyKeyboardRemove())
        await state.set_state(RegistrationFSM.RegName)
        return

    if "Компания" in txt:
        await state.update_data(role="organization")
        await message.answer("Название вашей компании:", reply_markup=types.ReplyKeyboardRemove())
        await state.set_state(RegistrationFSM.RegName)
        return

    await message.answer("Выберите роль кнопкой ниже 👇")


@router.message(RegistrationFSM.RegName)
async def reg_name(message: types.Message, state: FSMContext):
    name = (message.text or "").strip()
    if not name:
        await message.answer("Введите значение:")
        return

    await state.update_data(name=name)
    await message.answer("Ваш город:")
    await state.set_state(RegistrationFSM.RegCity)


@router.message(RegistrationFSM.RegCity)
async def reg_city(message: types.Message, state: FSMContext):
    city = (message.text or "").strip()
    await state.update_data(city=city)

    data = await state.get_data()
    if data.get("role") == "organization":
        await message.answer("Введите пароль (мин. 6 символов):")
        await state.set_state(RegistrationFSM.RegPassword)
    else:
        await message.answer("Кратко опишите ваш опыт:")
        await state.set_state(DescriptionFSM.EmployDesc)


@router.message(RegistrationFSM.RegPassword)
async def reg_password(message: types.Message, state: FSMContext):
    password = (message.text or "").strip()
    if len(password) < 6:
        await message.answer("Пароль слишком короткий. Минимум 6 символов. Повторите:")
        return

    await state.update_data(password=password)
    await message.answer("Описание компании:")
    await state.set_state(DescriptionFSM.EmployDesc)


@router.message(DescriptionFSM.EmployDesc)
async def reg_desc(message: types.Message, state: FSMContext):
    desc = (message.text or "").strip()
    await state.update_data(desc=desc)

    data = await state.get_data()
    tg_id = message.from_user.id

    if data.get("role") == "candidate":
        await message.answer("Ваше образование:")
        await state.set_state(SkillsFSM.Education)
        return

    # org finalize
    payload = {
        "email": data["email"],
        "password": data["password"],
        "name": data["name"],
        "city": data["city"],
        "description": data.get("desc"),
        "website": None,
        "telegram_id": str(tg_id),
    }
    await api.register_org(payload)

    await state.clear()
    await set_active_role(state, "organization")
    await message.answer("✅ Организация создана.", reply_markup=kb_employer())


@router.message(SkillsFSM.Education)
async def cand_edu(message: types.Message, state: FSMContext):
    await state.update_data(edu=(message.text or "").strip())
    await message.answer("Ваши ключевые навыки (Hard Skills):")
    await state.set_state(SkillsFSM.HardSkills)


@router.message(SkillsFSM.HardSkills)
async def cand_finish(message: types.Message, state: FSMContext):
    data = await state.get_data()
    tg_id = message.from_user.id

    payload = {
        "email": data["email"],
        "city": data.get("city"),
        "telegram_id": str(tg_id),
        "description_json": {
            "bio": data.get("desc"),
            "edu": data.get("edu"),
            "skills": (message.text or "").strip(),
        },
        "links": [],
        "category": None,
        "resume_text": None,
    }
    await api.register_candidate(payload)

    await state.clear()
    await set_active_role(state, "candidate")
    await message.answer("✅ Профиль кандидата создан.", reply_markup=kb_candidate())


# -----------------------------
# Guards
# -----------------------------
async def require_role(message: types.Message, state: FSMContext, role: str) -> bool:
    active = await get_active_role(state)
    if active == role:
        return True

    # если роль не установлена — пробуем автоопределить без /start
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


# -----------------------------
# Profile
# -----------------------------
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

# -----------------------------
# Candidate: vacancies feed
# -----------------------------
@router.message(F.text == "🔍 Вакансии")
async def candidate_feed(message: types.Message, state: FSMContext):
    if not await require_role(message, state, "candidate"):
        return

    tg_id = message.from_user.id
    recs = await api.get_recs_for_candidate(tg_id)
    if not recs:
        await message.answer("Пока нет рекомендаций вакансий.")
        return

    await state.update_data(c_recs=recs, c_idx=0, last_ctx_role="candidate", last_ctx_vacancy_id=int(recs[0]["entity_id"]))
    await show_vacancy_card(message, recs[0])

async def show_vacancy_card(message: types.Message, rec: dict):
    # 1) vacancy_id
    try:
        vacancy_id = int(rec.get("entity_id"))
    except Exception:
        await message.answer("⚠️ Не удалось определить vacancy_id из рекомендации.")
        return

    # 2) get vacancy
    try:
        vac = await api.get_vacancy(vacancy_id)
    except Exception as e:
        await message.answer(f"⚠️ Не удалось загрузить вакансию #{vacancy_id}: {e}")
        return

    if not isinstance(vac, dict):
        await message.answer(f"⚠️ Вакансия #{vacancy_id} вернулась в неожиданном формате.")
        return

    # 3) fields from recommendation
    match_pct = rec.get("match_percent_display") or rec.get("match_percent") or "—"
    conf = rec.get("confidence")

    # 4) fields from vacancy
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

    # match fast-path
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

    # next card
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


# -----------------------------
# Employer: candidates feed
# -----------------------------
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

    # cache org_id
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
    # cand_like_{vacancy_id}_{candidate_id}
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

    # next candidate
    recs = data.get("e_recs") or []
    idx = int(data.get("e_idx", 0)) + 1

    await state.update_data(last_ctx_role="organization", last_ctx_vacancy_id=vacancy_id)

    if idx < len(recs):
        await state.update_data(e_idx=idx)
        await show_candidate_card(callback.message, vacancy_id, recs[idx])
    else:
        await callback.message.answer("Конец списка кандидатов.", reply_markup=kb_employer())

    await callback.answer()


# -----------------------------
# Employer: create vacancy
# -----------------------------
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


@router.message(F.text == "📋 Мои вакансии")
async def my_vacs(message: types.Message, state: FSMContext):
    if not await require_role(message, state, "organization"):
        return
    tg_id = message.from_user.id
    vacs = await api.get_my_vacancies(tg_id)
    await message.answer(pretty.pretty_vacancies_list(vacs))


# -----------------------------
# Match check (common)
# -----------------------------
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