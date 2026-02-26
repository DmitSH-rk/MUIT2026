from aiogram import Router, F, types
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
            # [types.KeyboardButton(text="📋 Мои вакансии")],
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

