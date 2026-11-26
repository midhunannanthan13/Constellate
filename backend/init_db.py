import os
import pymysql
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent
env_path = BASE_DIR / '.env'
load_dotenv(env_path)

db_name = os.getenv('DB_NAME', 'constellate_db')
db_user = os.getenv('DB_USER', 'root')
db_password = os.getenv('DB_PASSWORD', '')
db_host = os.getenv('DB_HOST', '127.0.0.1')
db_port = int(os.getenv('DB_PORT', '3306'))

print(f"Connecting to MySQL on {db_host}:{db_port} as user '{db_user}'...")

passwords_to_try = [db_password]
if "" not in passwords_to_try:
    passwords_to_try.append("")

connection = None
connected_password = None

for pwd in passwords_to_try:
    try:
        conn = pymysql.connect(
            host=db_host,
            user=db_user,
            password=pwd,
            port=db_port
        )
        connection = conn
        connected_password = pwd
        print(f"Successfully connected to MySQL server (password: {'[blank]' if pwd == '' else '[provided in .env]'})")
        break
    except pymysql.err.OperationalError as e:
        last_error = e

if connection is None:
    print(f"ERROR: Could not connect to MySQL: {last_error}")
    exit(1)

try:
    with connection.cursor() as cursor:
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS `{db_name}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;")
        print(f"Database `{db_name}` is ready!")
    connection.commit()
finally:
    connection.close()

# If blank password succeeded and .env had placeholder, update .env with blank
if connected_password == "" and db_password == "your_mysql_password_here":
    with open(env_path, 'r', encoding='utf-8') as f:
        content = f.read()
    content = content.replace("DB_PASSWORD=your_mysql_password_here", "DB_PASSWORD=")
    with open(env_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Updated backend/.env with verified password configuration.")
