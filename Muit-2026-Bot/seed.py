from dbsql import init_db, reset_and_seed_db

def main():
    # Инициализация базы данных
    conn = init_db()
    
    # Сброс и заполнение базы данных
    reset_and_seed_db(conn)
    
    # Закрытие соединения
    conn.close()

if __name__ == "__main__":
    main()