from telegram.ext import Application, CommandHandler, CallbackQueryHandler, MessageHandler, filters, ConversationHandler
from handlers import start, delete_user_command, get_most_popular, select_role, switch_role, filter_on, filter_on_by_work, create_profile_experience, create_profile_languages,  create_profile_geo, create_profile_salary, handle_match, cancel, ROLE, PROFILE_EXPERIENCE, PROFILE_SALARY, LANGUAGES, GEO, MATCH

API_TOKEN = '7854506154:AAHevqLEwQXnc5KWbTzwlYl6q8vSoqCIgEw'


def main():
    """Run the bot."""
    app = Application.builder().token(API_TOKEN).build()

    # Define conversation handler
    conv_handler = ConversationHandler(
        entry_points=[CommandHandler('start', start), 
                      CommandHandler('switch_role', switch_role), 
                      CommandHandler('filtersLang', filter_on),
                      CommandHandler('filtersWork', filter_on_by_work),
                      CommandHandler('most_popular', get_most_popular),
                      CommandHandler('deleteUser', delete_user_command)],
        states={
            ROLE: [CallbackQueryHandler(select_role)],
            PROFILE_EXPERIENCE: [MessageHandler(filters.TEXT & ~filters.COMMAND, create_profile_experience)],
            LANGUAGES: [MessageHandler(filters.TEXT & ~filters.COMMAND, create_profile_languages)],
            GEO: [MessageHandler(filters.TEXT & ~filters.COMMAND, create_profile_geo)],
            PROFILE_SALARY: [MessageHandler(filters.TEXT & ~filters.COMMAND, create_profile_salary)],
            MATCH: [CallbackQueryHandler(handle_match)]
        },
        fallbacks=[CommandHandler('cancel', cancel)],
    )

    app.add_handler(conv_handler)
    app.run_polling()

if __name__ == '__main__':
    main()
