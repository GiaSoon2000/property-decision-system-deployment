import os
import psycopg2
from psycopg2.extras import RealDictCursor

def check_property_images():
    try:
        # 使用 Render PostgreSQL 數據庫
        conn = psycopg2.connect(
            host='dpg-d2aqb7fdiees73e29qt0-a.singapore-postgres.render.com',
            user='property_db_mk0k_user',
            password='GFL0ceMFr7z9zG2yI7XURfT59SlOP8so',
            database='property_db_mk0k',
            port='5432'
        )
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # 檢查 property_images 表結構
        cursor.execute("""
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'property_images'
            ORDER BY ordinal_position;
        """)
        columns = cursor.fetchall()
        print("📸 property_images 表結構:")
        for col in columns:
            print(f"  {col['column_name']}: {col['data_type']}")
        
        # 檢查 property_images 記錄數
        cursor.execute("SELECT COUNT(*) as count FROM property_images")
        count = cursor.fetchone()
        print(f"\n📊 property_images 表中的記錄數: {count['count']}")
        
        # 檢查前5條記錄
        cursor.execute("SELECT * FROM property_images LIMIT 5")
        images = cursor.fetchall()
        print(f"\n🔍 前5條記錄:")
        for img in images:
            print(f"  ID: {img['id']}, Property ID: {img['property_id']}, Image Path: {img['image_path']}")
        
        # 檢查 properties 和 property_images 的關聯
        cursor.execute("""
            SELECT p.id, p.name, COUNT(pi.id) as image_count
            FROM properties p
            LEFT JOIN property_images pi ON p.id = pi.property_id
            GROUP BY p.id, p.name
            ORDER BY p.id;
        """)
        properties_with_images = cursor.fetchall()
        print(f"\n🏠 Properties 及其圖片數量:")
        for prop in properties_with_images:
            print(f"  Property {prop['id']}: {prop['name']} - {prop['image_count']} images")
        
        cursor.close()
        conn.close()
        print("\n✅ 檢查完成！")
        
    except Exception as e:
        print(f"❌ 錯誤: {e}")

if __name__ == "__main__":
    check_property_images() 