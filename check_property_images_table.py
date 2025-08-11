import os
import psycopg2

def check_property_images_table():
    try:
        conn = psycopg2.connect(
            host=os.getenv('POSTGRES_HOST', 'dpg-d2aqb7fdiees73e29qt0-a.singapore-postgres.render.com'),
            user=os.getenv('POSTGRES_USER', 'property_db_mk0k_user'),
            password=os.getenv('POSTGRES_PASSWORD', 'GFL0ceMFr7z9zG2yI7XURfT59SlOP8so'),
            database=os.getenv('POSTGRES_DB', 'property_db_mk0k'),
            port=os.getenv('POSTGRES_PORT', '5432')
        )
        
        cursor = conn.cursor()
        
        # 檢查 property_images 表結構
        cursor.execute("""
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'property_images'
            ORDER BY ordinal_position
        """)
        columns = cursor.fetchall()
        
        print("🖼️ property_images 表結構:")
        for col in columns:
            print(f"  - {col[0]}: {col[1]} ({'NULL' if col[2] == 'YES' else 'NOT NULL'})")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ 錯誤: {e}")

if __name__ == "__main__":
    check_property_images_table() 