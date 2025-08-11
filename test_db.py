import os
import psycopg2
from psycopg2.extras import RealDictCursor

def test_database():
    try:
        # 連接數據庫
        conn = psycopg2.connect(
            host=os.getenv('POSTGRES_HOST', 'dpg-d2aqb7fdiees73e29qt0-a.singapore-postgres.render.com'),
            user=os.getenv('POSTGRES_USER', 'property_db_mk0k_user'),
            password=os.getenv('POSTGRES_PASSWORD', 'GFL0ceMFr7z9zG2yI7XURfT59SlOP8so'),
            database=os.getenv('POSTGRES_DB', 'property_db_mk0k'),
            port=os.getenv('POSTGRES_PORT', '5432')
        )
        
        print("✅ 數據庫連接成功！")
        
        # 使用 RealDictCursor 來獲取字典格式的結果
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # 檢查表是否存在
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        """)
        tables = cursor.fetchall()
        print(f"📋 數據庫中的表: {[table['table_name'] for table in tables]}")
        
        # 檢查 properties 表結構
        cursor.execute("""
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'properties'
        """)
        columns = cursor.fetchall()
        print(f"🏠 properties 表結構: {[(col['column_name'], col['data_type']) for col in columns]}")
        
        # 檢查是否有數據
        cursor.execute("SELECT COUNT(*) as count FROM properties")
        count = cursor.fetchone()
        print(f"📊 properties 表中的記錄數: {count['count']}")
        
        # 檢查前幾條記錄
        cursor.execute("SELECT id, name, area, price FROM properties LIMIT 3")
        properties = cursor.fetchall()
        print(f"🔍 前3條記錄: {[dict(prop) for prop in properties]}")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ 錯誤: {e}")

if __name__ == "__main__":
    test_database() 