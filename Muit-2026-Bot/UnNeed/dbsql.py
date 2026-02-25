import sqlite3
from ai_api import get_popular_professions_from_openai
def init_db():
    """Initialize the SQLite database and create tables if they don't exist."""
    conn = sqlite3.connect('profiles.db')
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS workers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER UNIQUE,
            name TEXT,
            skills TEXT,
            languages TEXT,
            geo TEXT,
            salary TEXT,
            username TEXT
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS employers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER UNIQUE,
            name TEXT,
            vacancy TEXT,
            languages TEXT,
            geo TEXT,
            salary TEXT,
            username TEXT
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS likes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            liker_id INTEGER,
            liked_id INTEGER,
            UNIQUE(liker_id, liked_id)
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS popular_professions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            salary TEXT,
            growth TEXT,
            description TEXT
        )
    ''')
    conn.commit()
    return conn

async def cache_popular_professions(conn):
    cursor = conn.cursor()
    cursor.execute('DELETE FROM popular_professions')

    professions = await get_popular_professions_from_openai()
    
    if not professions:
        return []
    
    # Сохраняем в базу данных
    valid_professions = []
    for prof in professions:
        try:
            if not isinstance(prof, dict):
                continue
            if not all(key in prof for key in ['name', 'salary', 'growth', 'description']):
                continue
            cursor.execute('''
                INSERT INTO popular_professions (name, salary, growth, description)
                VALUES (?, ?, ?, ?)
            ''', (prof['name'], prof['salary'], prof['growth'], prof['description']))
            valid_professions.append(prof)
        except Exception as e:
            continue
    
    conn.commit()
    return valid_professions

def get_popular_professions(conn):
    cursor = conn.cursor()
    cursor.execute('SELECT name, salary, growth, description FROM popular_professions')
    return [
        {'name': row[0], 'salary': row[1], 'growth': row[2], 'description': row[3]}
        for row in cursor.fetchall()
    ]

def reset_and_seed_db(conn):
    cursor = conn.cursor()

    cursor.execute('DELETE FROM workers')
    cursor.execute('DELETE FROM employers')
    cursor.execute('DELETE FROM likes')
    conn.commit()

    workers = [
        {
            'user_id': 1001,
            'name': 'Иван Иванов',
            'skills': 'Python, Django, Flask',
            'languages': 'English, Russian',
            'geo': 'Russia',
            'salary': '150000 RUB',
            'username': 'Worker1'
        },
        {
            'user_id': 1002,
            'name': 'Анна Смирнова',
            'skills': 'JavaScript, React, Node.js',
            'languages': 'English, German',
            'geo': 'Germany',
            'salary': '2000 EUR',
            'username': 'Worker2'
        }
    ]
    employers = [
        {
            'user_id': 2001,
            'name': 'TechCorp',
            'vacancy': 'Senior Python Developer',
            'languages': 'English, Russian',
            'geo': 'Russia',
            'salary': '160000 RUB',
            'username': 'Employer1'
        },
        {
            'user_id': 2002,
            'name': 'WebSolutions',
            'vacancy': 'Frontend Developer',
            'languages': 'English, German',
            'geo': 'Germany',
            'salary': '2500 EUR',
            'username': 'Employer2'
        }
    ]
    
    for worker in workers:
        add_worker_profile(
            conn,
            worker['user_id'],
            worker['name'],
            worker['skills'],
            worker['languages'],
            worker['geo'],
            worker['salary'],
            worker['username']
        )
    
    for employer in employers:
        add_employer_profile(
            conn,
            employer['user_id'],
            employer['name'],
            employer['vacancy'],
            employer['languages'],
            employer['geo'],
            employer['salary'],
            employer['username']
        )
    
    print("Database reset and seeded with test data.")

def get_worker_profile(conn, user_id):
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM workers WHERE user_id = ?', (user_id,))
    return cursor.fetchone()

def get_employer_profile(conn, user_id):
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM employers WHERE user_id = ?', (user_id,))
    return cursor.fetchone()

def get_all_employers(conn):
    cursor = conn.cursor()
    cursor.execute('SELECT id, user_id, name, vacancy, languages, geo, salary, username FROM employers')
    return [{'id': row[0], 'user_id': row[1], 'name': row[2], 'vacancy': row[3], 'languages': row[4], 'geo': row[5], 'salary': row[6], 'username': row[7]} for row in cursor.fetchall()]

def get_all_workers(conn):
    cursor = conn.cursor()
    cursor.execute('SELECT id, user_id, name, skills, languages, geo, salary, username FROM workers')
    return [{'id': row[0], 'user_id': row[1], 'name': row[2], 'skills': row[3], 'languages': row[4], 'geo': row[5], 'salary': row[6], 'username': row[7]} for row in cursor.fetchall()]

def get_filtered_employers(conn, user_languages):
    cursor = conn.cursor()
    cursor.execute('SELECT id, user_id, name, vacancy, languages, geo, salary, username FROM employers')
    profiles = [{'id': row[0], 'user_id': row[1], 'name': row[2], 'vacancy': row[3], 'languages': row[4], 'geo': row[5], 'salary': row[6], 'username': row[7]} for row in cursor.fetchall()]
    user_langs = set(lang.strip().lower() for lang in user_languages.split(',')) if user_languages else set()
    return [profile for profile in profiles if user_langs.intersection(set(lang.strip().lower() for lang in profile['languages'].split(',')))]

def get_filtered_workers(conn, user_languages):
    cursor = conn.cursor()
    cursor.execute('SELECT id, user_id, name, skills, languages, geo, salary, username FROM workers')
    profiles = [{'id': row[0], 'user_id': row[1], 'name': row[2], 'skills': row[3], 'languages': row[4], 'geo': row[5], 'salary': row[6], 'username': row[7]} for row in cursor.fetchall()]
    user_langs = set(lang.strip().lower() for lang in user_languages.split(',')) if user_languages else set()
    return [profile for profile in profiles if user_langs.intersection(set(lang.strip().lower() for lang in profile['languages'].split(',')))]

def get_filtered_employers_by_Work(conn, user_skills):
    cursor = conn.cursor()
    cursor.execute('SELECT id, user_id, name, vacancy, languages, geo, salary, username FROM employers')
    profiles = [{'id': row[0], 'user_id': row[1], 'name': row[2], 'vacancy': row[3], 'languages': row[4], 'geo': row[5], 'salary': row[6], 'username': row[7]} for row in cursor.fetchall()]
    user_skills_set = set(skill.strip().lower() for skill in user_skills.split(',')) if user_skills else set()
    return [profile for profile in profiles if user_skills_set.intersection(set(v.strip().lower() for v in profile['vacancy'].split(',')))]

def get_filtered_workers_by_Work(conn, user_vacancy):
    cursor = conn.cursor()
    cursor.execute('SELECT id, user_id, name, skills, languages, geo, salary, username FROM workers')
    profiles = [{'id': row[0], 'user_id': row[1], 'name': row[2], 'skills': row[3], 'languages': row[4], 'geo': row[5], 'salary': row[6], 'username': row[7]} for row in cursor.fetchall()]
    user_vacancy_set = set(v.strip().lower() for v in user_vacancy.split(',')) if user_vacancy else set()
    return [profile for profile in profiles if user_vacancy_set.intersection(set(skill.strip().lower() for skill in profile['skills'].split(',')))]

def add_worker_profile(conn, user_id, name, skills, languages, geo, salary, username):
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO workers (user_id, name, skills, languages, geo, salary, username)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (user_id, name, skills, languages, geo, salary, username))
    conn.commit()

def add_employer_profile(conn, user_id, name, vacancy, languages, geo, salary, username):
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO employers (user_id, name, vacancy, languages, geo, salary, username)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (user_id, name, vacancy, languages, geo, salary, username))
    conn.commit()

def add_like(conn, liker_id, liked_id):
    cursor = conn.cursor()
    try:
        cursor.execute('INSERT INTO likes (liker_id, liked_id) VALUES (?, ?)', (liker_id, liked_id))
        conn.commit()
    except sqlite3.IntegrityError:
        pass  # Лайк уже существует

def check_match(conn, user_id, liked_id):
    cursor = conn.cursor()
    cursor.execute('SELECT 1 FROM likes WHERE liker_id = ? AND liked_id = ?', (liked_id, user_id))
    return cursor.fetchone() is not None

def deleteUser(conn, user_id):
    cursor = conn.cursor()
    try:
        cursor.execute('DELETE FROM workers WHERE user_id = ?', (user_id,))
        worker_deleted = cursor.rowcount > 0

        cursor.execute('DELETE FROM employers WHERE user_id = ?', (user_id,))
        employer_deleted = cursor.rowcount > 0

        cursor.execute('DELETE FROM likes WHERE liker_id = ? OR liked_id = ?', (user_id, user_id))
        likes_deleted = cursor.rowcount

        conn.commit()
        return worker_deleted or employer_deleted
    except sqlite3.Error as e:
        conn.rollback()
        return False