import asyncio
import logging
import os

from aiogram import Bot, Dispatcher, types
from Handlers.josb import router


async def main():
    logging.basicConfig(level=logging.INFO)

    # token = os.getenv("BOT_TOKEN")
    # if not token:
    #     raise RuntimeError("BOT_TOKEN env var is required")

    bot = Bot(token="7854506154:AAHevqLEwQXnc5KWbTzwlYl6q8vSoqCIgEw")
    dp = Dispatcher()

    commands = [
        types.BotCommand(command="start", description="Запустить/Регистрация"),
        types.BotCommand(command="token", description="Установить access_token для API"),
        types.BotCommand(command="new_job", description="Создать вакансию (для компаний)"),
        types.BotCommand(command="help", description="Справка"),
    ]
    await bot.set_my_commands(commands)

    dp.include_router(router)

    print("Бот запущен.")
    await bot.delete_webhook(drop_pending_updates=True)
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())