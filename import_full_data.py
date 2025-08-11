# -*- coding: utf-8 -*-
import os
import psycopg2
from psycopg2.extras import RealDictCursor
import re

def import_full_data():
    try:
        conn = psycopg2.connect(
            host='dpg-d2aqb7fdiees73e29qt0-a.singapore-postgres.render.com',
            user='property_db_mk0k_user',
            password='GFL0ceMFr7z9zG2yI7XURfT59SlOP8so',
            database='property_db_mk0k',
            port='5432'
        )
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        print("🔄 開始導入完整數據...")
        
        # 清空現有數據
        print("🧹 清空現有數據...")
        cursor.execute("DELETE FROM property_images")
        cursor.execute("DELETE FROM properties")
        cursor.execute("ALTER SEQUENCE properties_id_seq RESTART WITH 1")
        cursor.execute("ALTER SEQUENCE property_images_id_seq RESTART WITH 1")
        
        # 讀取 MySQL dump 文件
        with open('mysqldump.sql', 'r', encoding='utf-8') as file:
            content = file.read()
        
        # 提取 properties 數據
        properties_match = re.search(r'INSERT INTO `properties` VALUES\s*\((.*?)\);', content, re.DOTALL)
        if properties_match:
            properties_data = properties_match.group(1)
            properties_lines = properties_data.split('),(')
            print(f"📊 找到 {len(properties_lines)} 個屬性")
            
            for i, line in enumerate(properties_lines):
                line = line.strip().strip('()')
                values = line.split(',')
                
                if len(values) >= 25:
                    try:
                        cursor.execute("""
                            INSERT INTO properties (
                                name, type, bedrooms, bathrooms, size, price, latitude, longitude,
                                area, form_of_interest, financing_options, submitted_by, approved_by,
                                status, submitted_at, approved_at, created_at, updated_at,
                                description, furnishing_status, facing_direction, year_built, facilities
                            ) VALUES (
                                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
                            )
                        """, (
                            values[1].strip("'") if values[1] != 'NULL' else None,
                            values[2].strip("'") if values[2] != 'NULL' else None,
                            int(values[3]) if values[3] != 'NULL' else None,
                            int(values[4]) if values[4] != 'NULL' else None,
                            float(values[5]) if values[5] != 'NULL' else None,
                            float(values[6]) if values[6] != 'NULL' else None,
                            float(values[7]) if values[7] != 'NULL' else None,
                            float(values[8]) if values[8] != 'NULL' else None,
                            values[9].strip("'") if values[9] != 'NULL' else None,
                            values[10].strip("'") if values[10] != 'NULL' else None,
                            values[11].strip("'") if values[11] != 'NULL' else None,
                            int(values[12]) if values[12] != 'NULL' else None,
                            int(values[13]) if values[13] != 'NULL' else None,
                            'approved',
                            values[15].strip("'") if values[15] != 'NULL' else None,
                            values[16].strip("'") if values[16] != 'NULL' else None,
                            values[17].strip("'") if values[17] != 'NULL' else None,
                            values[18].strip("'") if values[18] != 'NULL' else None,
                            values[19].strip("'") if values[19] != 'NULL' else None,
                            values[20].strip("'") if values[20] != 'NULL' else None,
                            values[21].strip("'") if values[21] != 'NULL' else None,
                            int(values[22]) if values[22] != 'NULL' else None,
                            values[23].strip("'") if values[23] != 'NULL' else None
                        ))
                        print(f"✅ 導入屬性 {i+1}")
                        
                    except Exception as e:
                        print(f"❌ 導入屬性 {i+1} 失敗: {e}")
                        continue
        
        # 提取 property_images 數據
        images_match = re.search(r'INSERT INTO `property_images` VALUES\s*\((.*?)\);', content, re.DOTALL)
        if images_match:
            images_data = images_match.group(1)
            images_lines = images_data.split('),(')
            print(f"📸 找到 {len(images_lines)} 張圖片")
            
            for i, line in enumerate(images_lines):
                line = line.strip().strip('()')
                values = line.split(',')
                
                if len(values) >= 5:
                    try:
                        property_id = int(values[2]) if values[2] != 'NULL' else None
                        image_path = values[3].strip("'") if values[3] != 'NULL' else None
                        
                        if property_id and image_path:
                            cursor.execute("""
                                INSERT INTO property_images (property_id, image_path, created_at)
                                VALUES (%s, %s, %s)
                            """, (property_id, image_path, values[4].strip("'") if values[4] != 'NULL' else None))
                            print(f"✅ 導入圖片 {i+1}: {image_path}")
                        
                    except Exception as e:
                        print(f"❌ 導入圖片 {i+1} 失敗: {e}")
                        continue
        
        conn.commit()
        
        cursor.execute("SELECT COUNT(*) as count FROM properties")
        properties_count = cursor.fetchone()['count']
        
        cursor.execute("SELECT COUNT(*) as count FROM property_images")
        images_count = cursor.fetchone()['count']
        
        print(f"\n🎉 導入完成！")
        print(f"📊 屬性數量: {properties_count}")
        print(f"📸 圖片數量: {images_count}")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ 錯誤: {e}")

if __name__ == "__main__":
    import_full_data() 