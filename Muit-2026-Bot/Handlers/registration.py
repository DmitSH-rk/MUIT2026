# Handlers/registration.py
from aiogram import Router, types
from aiogram.fsm.context import FSMContext

from FSMs.RegistrationFSM import RegistrationFSM
from FSMs.DescriptionFSM import DescriptionFSM
from FSMs.SkillsFSM import SkillsFSM

from Handlers.deps import api
from Handlers.keyboards import kb_candidate, kb_employer
from Handlers.role import set_active_role

router = Router()


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