from telegram import Update, InlineKeyboardMarkup, InlineKeyboardButton
from telegram.ext import Application, CommandHandler, CallbackQueryHandler, MessageHandler, filters, ConversationHandler
from dbsql import init_db, deleteUser, cache_popular_professions, get_popular_professions, get_worker_profile, get_employer_profile, get_filtered_employers, get_filtered_workers, get_all_employers, get_all_workers, add_worker_profile, add_employer_profile, get_filtered_employers_by_Work, get_filtered_workers_by_Work, add_like, check_match

# Инициализация базы данных
conn = init_db()

# In-memory storage for user session data
users = {}

# Conversation states
ROLE, PROFILE_EXPERIENCE, PROFILE_SALARY, LANGUAGES, GEO, MATCH = range(6)

async def delete_user_command(update: Update, context) -> None:
    user_id = update.message.from_user.id

    success = deleteUser(conn, user_id)
    
    if success:
        await update.message.reply_text(
            "Ваш профиль успешно удалён из базы данных. Теперь нажмите /cancel и /start для новой сессии",
            parse_mode='Markdown'
        )
    else:
        await update.message.reply_text(
            "Ваш профиль не найден в базе данных.",
            parse_mode='Markdown'
        )



async def start(update: Update, context) -> int:
    user_id = update.message.from_user.id

    worker_profile = get_worker_profile(conn, user_id)
    employer_profile = get_employer_profile(conn, user_id)

    if worker_profile or employer_profile:
        role = 'worker' if worker_profile else 'employer'
        users[user_id] = {'role': role, 'current_profile_index': 0, 'filter_lang': False, 'filter_work': False}
        await update.message.reply_text(f'Добро пожаловать обратно! Ваша роль: {role}. Переходим к просмотру профилей.')
        await update.message.reply_text('Напоминаю свои команды' 
        '\n /start - начать диалог'
        '\n /cancel - отмена диалога'
        '\n!Чтобы использовать КОМАНДЫ БОТА закончите мэтч!'
        '\n /most_popular - получить самые популярные профессии по мнению ИИ'
        '\n /filtersLang - фильтры по языку'
        '\n /filtersWork - фильтры по специальности'
        '\n /deleteUser - в этой команде великая сила! Удалить пользователя!')
        return await match_worker(update, context, user_id)
    
    await update.message.reply_text(
        'Привет! Я бот для поиска работы и сотрудников. Чем вы являетесь: работником или работодателем?\n Вот мои команды:'
        '\n /start - начать диалог'
        '\n /cancel - отмена диалога'
        '\n!Чтобы использовать КОМАНДЫ БОТА закончите мэтч!'
        '\n /most_popular - получить самые популярные профессии по мнению ИИ'
        '\n /filtersLang - фильтры по языку'
        '\n /filtersWork - фильтры по специальности'
        '\n /deleteUser - в этой команде великая сила! Удалить пользователя!',
        reply_markup=InlineKeyboardMarkup([
            [InlineKeyboardButton("Работник", callback_data='worker')],
            [InlineKeyboardButton("Работодатель", callback_data='employer')]
        ])
    )
    return ROLE

async def switch_role(update: Update, context) -> int:
    await update.message.reply_text(
        'Смена роли. Пожалуйста, выберите вашу роль:',
        reply_markup=InlineKeyboardMarkup([
            [InlineKeyboardButton("Работник", callback_data='worker')],
            [InlineKeyboardButton("Работодатель", callback_data='employer')]
        ])
    )
    return ROLE

async def select_role(update: Update, context) -> int:
    query = update.callback_query
    await query.answer()
    role = query.data
    user_id = query.from_user.id

    users[user_id] = {'role': role, 'current_profile_index': 0, 'filter_lang': False, 'filter_work': False}
    if role == 'worker':
        await query.edit_message_text('Вы выбрали роль Работника. Пожалуйста, введите ваш опыт работы (навыки):')
        return PROFILE_EXPERIENCE
    elif role == 'employer':
        await query.edit_message_text('Вы выбрали роль Работодателя. Пожалуйста, введите название компании:')
        return PROFILE_EXPERIENCE

async def create_profile_experience(update: Update, context) -> int:
    user_id = update.message.from_user.id
    role = users.get(user_id, {}).get('role')

    if not role:
        await update.message.reply_text('Ошибка: роль не выбрана. Пожалуйста, начните заново с /start.')
        return ConversationHandler.END

    if role == 'worker':
        users[user_id]['skills'] = update.message.text
        await update.message.reply_text(f'Ваши навыки: {update.message.text}. \nТеперь укажите желаемый язык.')
        return LANGUAGES
    elif role == 'employer':
        users[user_id]['company_name'] = update.message.text
        await update.message.reply_text(f'Название вашей компании: {update.message.text}. \nТеперь укажите языки необходимые для работы.')
        return LANGUAGES

async def create_profile_languages(update: Update, context) -> int:
    user_id = update.message.from_user.id
    role = users.get(user_id, {}).get('role')

    if not role:
        await update.message.reply_text('Ошибка: роль не выбрана. Пожалуйста, начните заново с /start.')
        return ConversationHandler.END

    if role == 'worker':
        users[user_id]['languages'] = update.message.text
        await update.message.reply_text(f'Ваш язык: {update.message.text}. \nТеперь укажите страну для вашей командировки ✈️.')
        return GEO
    elif role == 'employer':
        users[user_id]['languages'] = update.message.text
        await update.message.reply_text(f'Язык для компании: {update.message.text}. \nТеперь укажите страну, в которую приглашаете стажера ✈️.')
        return GEO

async def create_profile_geo(update: Update, context) -> int:
    user_id = update.message.from_user.id
    role = users.get(user_id, {}).get('role')

    if not role:
        await update.message.reply_text('Ошибка: роль не выбрана. Пожалуйста, начните заново с /start.')
        return ConversationHandler.END

    if role == 'worker':
        users[user_id]['geo'] = update.message.text
        await update.message.reply_text(f'Желаемая страна: {update.message.text}. \nТеперь укажите желаемую зарплату 💸.')
        return PROFILE_SALARY
    elif role == 'employer':
        users[user_id]['geo'] = update.message.text
        await update.message.reply_text(f'Место работы: {update.message.text}. \nТеперь укажите вакансию.')
        return PROFILE_SALARY

async def create_profile_salary(update: Update, context) -> int:
    user_id = update.message.from_user.id
    role = users.get(user_id, {}).get('role')
    user_name = update.message.from_user.first_name or "Без имени"
    username = update.message.from_user.username or None  # Сохраняем username

    if not role:
        await update.message.reply_text('Ошибка: роль не выбрана. Пожалуйста, начните заново с /start.')
        return ConversationHandler.END

    if role == 'worker':
        users[user_id]['salary'] = update.message.text
        add_worker_profile(
            conn,
            user_id,
            user_name,
            users[user_id]['skills'],
            users[user_id]['languages'],
            users[user_id]['geo'],
            users[user_id]['salary'],
            username
        )
        await update.message.reply_text(
            f'Профиль работника создан!\nИмя: {user_name}\nНавыки: {users[user_id]["skills"]}\nЯзыки: {users[user_id]["languages"]}\nСтрана: {users[user_id]["geo"]}\nЗарплата: {users[user_id]["salary"]}\nПереходим к поиску вакансий.'
        )
        users[user_id] = {'role': role, 'current_profile_index': 0, 'filter_lang': False, 'filter_work': False}
        return await match_worker(update, context, user_id)
    elif role == 'employer':
        users[user_id]['vacancy'] = update.message.text
        add_employer_profile(
            conn,
            user_id,
            users[user_id]['company_name'],
            users[user_id]['vacancy'],
            users[user_id]['languages'],
            users[user_id]['geo'],
            'По договоренности',
            username
        )
        await update.message.reply_text(
            f'Профиль работодателя создан!\nКомпания: {users[user_id]["company_name"]}\nЯзыки: {users[user_id]["languages"]}\nСтрана: {users[user_id]["geo"]}\nВакансия: {users[user_id]["vacancy"]}\nПереходим к поиску сотрудников.'
        )
        # Clear user data
        users[user_id] = {'role': role, 'current_profile_index': 0, 'filter_lang': False, 'filter_work': False}
        return await match_worker(update, context, user_id)

async def filter_on(update: Update, context) -> int:
    user_id = update.message.from_user.id
    if user_id not in users:
        users[user_id] = {'filter_lang': False, 'filter_work': False}
    
    users[user_id]['filter_lang'] = not users[user_id].get('filter_lang', False)
    users[user_id]['current_profile_index'] = 0
    status = "включена" if users[user_id]['filter_lang'] else "выключена"
    await update.message.reply_text(f'Фильтрация по языкам {status}.')
    
    if users[user_id].get('role'):
        return await match_worker(update, context, user_id)
    return ConversationHandler.END

async def filter_on_by_work(update: Update, context) -> int:
    user_id = update.message.from_user.id
    if user_id not in users:
        users[user_id] = {'filter_lang': False, 'filter_work': False}
    
    users[user_id]['filter_work'] = not users[user_id].get('filter_work', False)
    users[user_id]['current_profile_index'] = 0
    status = "включена" if users[user_id]['filter_work'] else "выключена"
    await update.message.reply_text(f'Фильтрация по навыкам/вакансиям {status}.')
    
    if users[user_id].get('role'):
        return await match_worker(update, context, user_id)
    return ConversationHandler.END

async def match_worker(update: Update, context, user_id=None) -> int:
    if user_id is None:
        if update.message:
            user_id = update.message.from_user.id
        elif update.callback_query:
            user_id = update.callback_query.from_user.id
        else:
            return ConversationHandler.END

    role = users.get(user_id, {}).get('role')
    current_index = users.get(user_id, {}).get('current_profile_index', 0)
    filter_lang = users.get(user_id, {}).get('filter_lang', False)
    filter_work = users.get(user_id, {}).get('filter_work', False)

    if not role:
        if update.message:
            await update.message.reply_text('Ошибка: роль не выбрана. Пожалуйста, начните заново с /start.')
        elif update.callback_query:
            await update.callback_query.message.reply_text('Ошибка: роль не выбрана. Пожалуйста, начните заново с /start.')
        return ConversationHandler.END

    user_languages = None
    user_work = None
    if role == 'worker':
        profile = get_worker_profile(conn, user_id)
        if profile:
            user_languages = profile[4] or ""
            user_work = profile[3] or ""
    else:
        profile = get_employer_profile(conn, user_id)
        if profile:
            user_languages = profile[4] or ""
            user_work = profile[3] or ""

    if filter_lang and not user_languages:
        if update.message:
            await update.message.reply_text('В вашем профиле не указаны языки. Пожалуйста, обновите профиль.')
        elif update.callback_query:
            await update.callback_query.message.reply_text('В вашем профиле не указаны языки. Пожалуйста, обновите профиль.')
        return ConversationHandler.END
    if filter_work and not user_work:
        if update.message:
            await update.message.reply_text('В вашем профиле не указаны навыки/вакансия. Пожалуйста, обновите профиль.')
        elif update.callback_query:
            await update.callback_query.message.reply_text('В вашем профиле не указаны навыки/вакансия. Пожалуйста, обновите профиль.')
        return ConversationHandler.END

    profiles = get_all_employers(conn) if role == 'worker' else get_all_workers(conn)
    
    if filter_lang:
        profiles = get_filtered_employers(conn, user_languages) if role == 'worker' else get_filtered_workers(conn, user_languages)
    
    if filter_work:
        profiles = get_filtered_employers_by_Work(conn, user_work) if role == 'worker' else get_filtered_workers_by_Work(conn, user_work)
    
    if filter_lang and filter_work:
        lang_filtered = get_filtered_employers(conn, user_languages) if role == 'worker' else get_filtered_workers(conn, user_languages)
        work_filtered = get_filtered_employers_by_Work(conn, user_work) if role == 'worker' else get_filtered_workers_by_Work(conn, user_work)
        profiles = [p for p in lang_filtered if p in work_filtered]

    if not profiles:
        if update.message:
            await update.message.reply_text('Нет профилей, соответствующих вашим критериям! Попробуйте изменить настройки фильтра или проверить позже.')
        elif update.callback_query:
            await update.callback_query.message.reply_text('Нет профилей, соответствующих вашим критериям! Попробуйте изменить настройки фильтра или проверить позже.')
        return ConversationHandler.END

    if current_index >= len(profiles):
        if update.message:
            await update.message.reply_text('Больше подходящих профилей нет! Не забывайте проверить [сайт](https://aibekin.github.io/hackaton_front/) 😉', parse_mode='Markdown')
        elif update.callback_query:
            await update.callback_query.message.reply_text('Больше подходящих профилей нет! Не забывайте проверить [сайт](https://aibekin.github.io/hackaton_front/) 😉', parse_mode='Markdown')
        return ConversationHandler.END

    profile = profiles[current_index]
    keyboard = [
        [InlineKeyboardButton("❤️ Лайк", callback_data=f'like_{profile["id"]}'),
         InlineKeyboardButton("👎 Дизлайк", callback_data=f'dislike_{profile["id"]}')],
    ]
    text = (
        f"Работодатель: {profile['name']}\nВакансия: {profile['vacancy']}\nНеобходимый язык: {profile['languages']}\nСтрана: {profile['geo']}\nЗарплата: {profile['salary']}"
        if role == 'worker' else
        f"Работник: {profile['name']}\nНавыки: {profile['skills']}\nНеобходимый язык: {profile['languages']}\nСтрана: {profile['geo']}\nЗарплата: {profile['salary']}"
    )

    if update.message:
        await update.message.reply_text(text, reply_markup=InlineKeyboardMarkup(keyboard))
    elif update.callback_query:
        await update.callback_query.message.reply_text(text, reply_markup=InlineKeyboardMarkup(keyboard))

    return MATCH

async def handle_match(update: Update, context) -> int:
    query = update.callback_query
    await query.answer()
    data = query.data
    user_id = query.from_user.id
    role = users.get(user_id, {}).get('role')

    if not role:
        await query.message.reply_text('Ошибка: роль не выбрана. Пожалуйста, начните заново с /start.')
        return ConversationHandler.END

    if data.startswith('like'):
        profile_id = int(data.split('_')[1])
        profiles = get_all_employers(conn) if role == 'worker' else get_all_workers(conn)
        liked_profile = next((p for p in profiles if p['id'] == profile_id), None)
        if not liked_profile:
            await query.message.reply_text('Ошибка: профиль не найден.')
            return ConversationHandler.END

        liked_user_id = liked_profile['user_id']
        add_like(conn, user_id, liked_user_id)

        if check_match(conn, user_id, liked_user_id):
            user_profile = get_worker_profile(conn, user_id) if role == 'worker' else get_employer_profile(conn, user_id)
            user_username = user_profile[7] or f"ID: {user_id}"
            liked_username = liked_profile['username'] or f"ID: {liked_user_id}"

            match_text = (
                f"🎉 Это матч! Вы понравились друг другу!\n"
                f"Свяжитесь с {liked_profile['name']} через @{liked_username if liked_username.startswith('ID:') else liked_username}\n"
                f"Профиль: {liked_profile['vacancy' if role == 'worker' else 'skills']}"
            )
            await query.message.reply_text(match_text)

            match_text_other = (
                f"🎉 Это матч! Вы понравились друг другу!\n"
                f"Свяжитесь с {user_profile[2]} через @{user_username if user_username.startswith('ID:') else user_username}\n"
                f"Профиль: {user_profile[3]}"
            )
            try:
                await context.bot.send_message(chat_id=liked_user_id, text=match_text_other)
            except Exception as e:
                print(f"Ошибка при отправке сообщения пользователю {liked_user_id}: {e}")

        users[user_id]['current_profile_index'] += 1
        return await match_worker(update, context, user_id)
    elif data.startswith('dislike'):
        profile_id = int(data.split('_')[1])
        users[user_id]['current_profile_index'] += 1
        return await match_worker(update, context, user_id)

async def get_most_popular(update: Update, context) -> None:
    professions = await cache_popular_professions(conn)

    professions = get_popular_professions(conn)
    
    if not professions:
        professions = await cache_popular_professions(conn)
    
    if not professions:
        professions = [
            {'name': 'Data Scientist', 'salary': '$120,000', 'growth': '35% by 2030', 'description': 'Analyzes data using machine learning.'},
            {'name': 'Software Developer', 'salary': '$130,000', 'growth': '20% by 2030', 'description': 'Designs software applications.'},
            {'name': 'Nurse Practitioner', 'salary': '$125,000', 'growth': 'High demand', 'description': 'Provides healthcare services.'},
            {'name': 'Cybersecurity Analyst', 'salary': '$115,000', 'growth': '32% by 2030', 'description': 'Protects systems from cyber threats.'},
            {'name': 'AI Specialist', 'salary': '$140,000', 'growth': '25% by 2030', 'description': 'Develops AI algorithms and models.'},
        ]
    
    message = "📊 Самые популярные профессии 2025 года:\n\n"
    valid_professions = 0
    for i, prof in enumerate(professions[:10], 1):  # Ограничиваем до 10 профессий
        if not isinstance(prof, dict):
            continue
        try:
            message += (
                f"{i}. **{prof['name']}**\n"
                f"💰 Средняя зарплата: {prof['salary']}\n"
                f"📈 Рост занятости: {prof['growth']}\n"
                f"📝 Описание: {prof['description']}\n\n"
            )
            valid_professions += 1
        except KeyError as e:
            continue
    
    if valid_professions == 0:
        await update.message.reply_text("Не удалось сформировать список профессий. Попробуйте позже.", parse_mode='Markdown')
        return
    
    if len(message) > 4000:
        messages = [message[i:i+4000] for i in range(0, len(message), 4000)]
        for msg in messages:
            await update.message.reply_text(msg, parse_mode='Markdown')
    else:
        await update.message.reply_text(message, parse_mode='Markdown')

async def cancel(update: Update, context) -> int:
    await update.message.reply_text('Операция отменена. Начните заново с /start.')
    return ConversationHandler.END