# -*- coding: utf-8 -*-
import psycopg2
from psycopg2.extras import RealDictCursor

def check_users():
    try:
        conn = psycopg2.connect(
            host='dpg-d2aqb7fdiees73e29qt0-a.singapore-postgres.render.com',
            user='property_db_mk0k_user',
            password='GFL0ceMFr7z9zG2yI7XURfT59SlOP8so',
            database='property_db_mk0k',
            port='5432'
        )
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        cursor.execute("SELECT * FROM users")
        users = cursor.fetchall()
        
        print(f"👥 用戶數量: {len(users)}")
        for user in users:
            print(f"  ID: {user['id']}, Email: {user['email']}, Role: {user['role']}")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ 錯誤: {e}")

if __name__ == "__main__":
    check_users() 