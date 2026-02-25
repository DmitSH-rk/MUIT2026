import uuid
from aiogram import Router, F, types
from aiogram.filters import CommandStart, Command
from aiogram.fsm.context import FSMContext

# Импорт ваших стейтов
from FSMs.RegistrationFSM import RegistrationFSM
from FSMs.DescriptionFSM import DescriptionFSM
from FSMs.SkillsFSM import SkillsFSM
from FSMs.VacationFSM import VacationCreateFSM
from FSMs.ExpirienceFSM import ExperienceInfoFSM
from FSMs.SearchFSM import SearchFSM
from Api.UserApi.EmployeeApi import EmploymentAPI
from Api.ApiInst import router, api


# --- СТАРТ И АВТОРИЗАЦИЯ ---
@router.message(CommandStart())
async def cmd_start(message: types.Message, state: FSMContext):
    await state.clear()
    user = await api.check_tg_user(message.from_user.id, message.from_user.username)
    
    if user['is_linked']:
        await message.answer(f"Добро пожаловать! Вы вошли как {user['available_roles'][0]}.")
    else:
        await message.answer("Вы не зарегистрированы. Введите ваш Email:")
        await state.set_state(RegistrationFSM.RegEmail)

# --- РЕГИСТРАЦИЯ (RegistrationFSM) ---
@router.message(RegistrationFSM.RegEmail)
async def process_email(message: types.Message, state: FSMContext):
    await state.update_data(email=message.text)
    kb = types.ReplyKeyboardMarkup(keyboard=[
        [types.KeyboardButton(text="Кандидат"), types.KeyboardButton(text="Организация")]
    ], resize_keyboard=True)
    await message.answer("Выберите вашу роль:", reply_markup=kb)
    await state.set_state(RegistrationFSM.RegRole)

@router.message(RegistrationFSM.RegRole)
async def process_role(message: types.Message, state: FSMContext):
    role = "organization" if message.text == "Организация" else "candidate"
    await state.update_data(role=role)
    await message.answer("Введите ваше имя или название компании:", reply_markup=types.ReplyKeyboardRemove())
    await state.set_state(RegistrationFSM.RegName)

@router.message(RegistrationFSM.RegName)
async def process_name(message: types.Message, state: FSMContext):
    await state.update_data(name=message.text)
    await message.answer("Введите ваш город:")
    await state.set_state(RegistrationFSM.RegCity)

@router.message(RegistrationFSM.RegCity)
async def process_city(message: types.Message, state: FSMContext):
    await state.update_data(city=message.text)
    data = await state.get_data()
    if data['role'] == "organization":
        await message.answer("Придумайте пароль:")
        await state.set_state(RegistrationFSM.RegPassword)
    else:
        await message.answer("Расскажите о себе (мини-резюме):")
        await state.set_state(DescriptionFSM.EmployDesc)

@router.message(RegistrationFSM.RegPassword)
async def process_password(message: types.Message, state: FSMContext):
    await state.update_data(password=message.text)
    await message.answer("Опишите вашу компанию:")
    await state.set_state(DescriptionFSM.EmployDesc)

# --- ДОПОЛНИТЕЛЬНАЯ ИНФОРМАЦИЯ (DescriptionFSM & SkillsFSM) ---
@router.message(DescriptionFSM.EmployDesc)
async def process_desc(message: types.Message, state: FSMContext):
    await state.update_data(description=message.text)
    data = await state.get_data()
    
    if data['role'] == "organization":
        # Завершение регистрации Организации
        payload = {
            "email": data['email'], "password": data['password'],
            "name": data['name'], "city": data['city'],
            "description": data['description'], "telegram_id": str(message.from_user.id)
        }
        await api.register_org(payload)
        await message.answer("Организация успешно зарегистрирована!")
        await state.clear()
    else:
        await message.answer("Укажите ваше образование:")
        await state.set_state(SkillsFSM.Education)

@router.message(SkillsFSM.Education)
async def process_edu(message: types.Message, state: FSMContext):
    await state.update_data(edu=message.text)
    await message.answer("Перечислите ваши Hard Skills (через запятую):")
    await state.set_state(SkillsFSM.HardSkills)

@router.message(SkillsFSM.HardSkills)
async def process_skills_final(message: types.Message, state: FSMContext):
    data = await state.get_data()
    payload = {
        "email": data['email'],
        "city": data['city'],
        "telegram_id": str(message.from_user.id),
        "description_json": {
            "bio": data['description'],
            "education": data['edu'],
            "skills": message.text.split(",")
        }
    }
    await api.register_candidate(payload)
    await message.answer("Ваш профиль кандидата создан!")
    await state.clear()

# --- СОЗДАНИЕ ВАКАНСИИ (VacationCreateFSM + ExperienceInfoFSM) ---
@router.message(Command("create_vacancy"))
async def start_vacancy(message: types.Message, state: FSMContext):
    await message.answer("Введите название должности:")
    await state.set_state(VacationCreateFSM.VacRoleSearch)

@router.message(VacationCreateFSM.VacRoleSearch)
async def vac_role(message: types.Message, state: FSMContext):
    await state.update_data(role=message.text)
    await message.answer("Какой опыт работы требуется (лет)?")
    await state.set_state(ExperienceInfoFSM.ExperienceInfoVac)

@router.message(ExperienceInfoFSM.ExperienceInfoVac)
async def vac_exp(message: types.Message, state: FSMContext):
    await state.update_data(exp=message.text)
    await message.answer("Полное описание вакансии:")
    await state.set_state(VacationCreateFSM.VacDesc)

@router.message(VacationCreateFSM.VacDesc)
async def vac_finish(message: types.Message, state: FSMContext):
    data = await state.get_data()
    # Здесь предполагается, что токен мы получили ранее или используем auth-механизм
    # Для примера передаем пустой токен (в реальности его надо хранить в БД/State)
    payload = {
        "position_title": data['role'],
        "description_json": {"text": message.text, "exp_required": data['exp']},
        "city": "Remote", "is_remote": True
    }
    await api.create_vacancy(token="USER_TOKEN", payload=payload)
    await message.answer("Вакансия опубликована!")
    await state.clear()

# --- ПОИСК И СВАЙПЫ (SearchFSM) ---
@router.message(Command("search"))
async def start_search(message: types.Message, state: FSMContext):
    recs = await api.get_recs_for_candidate(token="USER_TOKEN")
    if not recs:
        return await message.answer("Нет подходящих вакансий.")
    
    await state.update_data(recs=recs, current_idx=0)
    await show_card(message, recs[0])
    await state.set_state(SearchFSM.StartSearch)

async def show_card(message: types.Message, item: dict):
    kb = types.InlineKeyboardMarkup(inline_keyboard=[[
        types.InlineKeyboardButton(text="👎 Дизлайк", callback_data=f"swipe_dislike_{item['entity_id']}"),
        types.InlineKeyboardButton(text="👍 Лайк", callback_data=f"swipe_like_{item['entity_id']}")
    ]])
    await message.answer(
        f"Вакансия: {item.get('position_title', 'Без названия')}\n"
        f"Совпадение: {item['match_percent_display']}%\n"
        f"ID: {item['entity_id']}", 
        reply_markup=kb
    )

@router.callback_query(F.data.startswith("swipe_"))
async def handle_swipe(callback: types.CallbackQuery, state: FSMContext):
    _, action, target_id = callback.data.split("_")
    data = await state.get_data()
    
    # Идемпотентность!
    ikey = str(uuid.uuid4())
    
    await api.send_reaction(ikey, {
        "initiator_entity_type": data.get('role', 'candidate'),
        "initiator_entity_id": 1, # В реальности берем из профиля /me
        "target_entity_type": "organization",
        "target_entity_id": int(target_id),
        "action": action,
        "source": "telegram_bot"
    })
    
    new_idx = data['current_idx'] + 1
    if new_idx < len(data['recs']):
        await state.update_data(current_idx=new_idx)
        await show_card(callback.message, data['recs'][new_idx])
    else:
        await callback.message.answer("Вакансии закончились!")
        await state.set_state(SearchFSM.EndSearch)
    await callback.answer()