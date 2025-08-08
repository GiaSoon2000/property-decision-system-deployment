#!/usr/bin/env python3
"""
簡化的 PostgreSQL 導入腳本
手動創建表結構和導入數據
"""

import psycopg2
import os
import sys
from urllib.parse import urlparse

def parse_database_url(database_url):
    """解析數據庫 URL"""
    parsed = urlparse(database_url)
    return {
        'host': parsed.hostname,
        'port': parsed.port or 5432,
        'database': parsed.path[1:],
        'user': parsed.username,
        'password': parsed.password
    }

def create_tables(cursor):
    """創建表結構"""
    print("📊 創建表結構...")
    
    # 創建 users 表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(100) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            email VARCHAR(100) NOT NULL UNIQUE,
            phone VARCHAR(20),
            role VARCHAR(10) NOT NULL CHECK (role IN ('user', 'REN', 'admin')),
            status VARCHAR(10) DEFAULT 'active' CHECK (status IN ('active', 'banned')),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # 創建 profiles 表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS profiles (
            user_id INTEGER PRIMARY KEY REFERENCES users(id),
            occupation VARCHAR(255),
            preferred_area VARCHAR(255),
            preferred_property_type VARCHAR(255),
            price_range_min NUMERIC(10,2),
            price_range_max NUMERIC(10,2),
            REN_id VARCHAR(100),
            company_name VARCHAR(255),
            verified_status BOOLEAN DEFAULT false
        )
    """)
    
    # 創建 properties 表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS properties (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255),
            type VARCHAR(255),
            bedrooms INTEGER,
            bathrooms INTEGER,
            size REAL,
            price NUMERIC(10,2),
            latitude NUMERIC(9,6),
            longitude NUMERIC(9,6),
            area VARCHAR(255),
            form_of_interest VARCHAR(50),
            financing_options VARCHAR(255),
            submitted_by INTEGER REFERENCES users(id),
            approved_by INTEGER REFERENCES users(id),
            status VARCHAR(50) DEFAULT 'pending',
            submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            approved_at TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            description TEXT,
            furnishing_status VARCHAR(50),
            facing_direction VARCHAR(100),
            year_built INTEGER,
            facilities TEXT
        )
    """)
    
    # 創建 pending_properties 表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS pending_properties (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255),
            type VARCHAR(255),
            bedrooms INTEGER,
            bathrooms INTEGER,
            size REAL,
            price NUMERIC(10,2),
            latitude NUMERIC(9,6),
            longitude NUMERIC(9,6),
            area VARCHAR(255),
            form_of_interest VARCHAR(50),
            financing_options VARCHAR(255),
            status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
            submitted_by INTEGER REFERENCES users(id),
            rejection_reason VARCHAR(255),
            rejected_at TIMESTAMP,
            description TEXT,
            furnishing_status VARCHAR(50),
            facing_direction VARCHAR(100),
            year_built INTEGER,
            facilities TEXT
        )
    """)
    
    # 創建 notifications 表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS notifications (
            id SERIAL PRIMARY KEY,
            recipient_id INTEGER REFERENCES users(id),
            message TEXT,
            type VARCHAR(20) CHECK (type IN ('new_launch', 'inquiry_response', 'property', 'system')),
            property_id INTEGER REFERENCES properties(id),
            is_read BOOLEAN DEFAULT false,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # 創建 property_images 表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS property_images (
            id SERIAL PRIMARY KEY,
            pending_property_id INTEGER REFERENCES pending_properties(id),
            property_id INTEGER REFERENCES properties(id),
            image_path VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # 創建 user_favorites 表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS user_favorites (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id),
            property_id INTEGER NOT NULL REFERENCES properties(id),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    print("✅ 表結構創建完成！")

def import_sample_data(cursor):
    """導入示例數據"""
    print("📥 導入示例數據...")
    
    # 插入用戶數據
    cursor.execute("""
        INSERT INTO users (username, password, email, phone, role, status) VALUES
        ('admin', '$2b$12$sA5p9WUJkzemIj1SfoFXeegEM9fiPTAcMq/r3rz.5Zhb2exd1WB6m', 'admin168@gmail.com', '1234567890', 'admin', 'active'),
        ('Ricky', '$2b$12$7EVB5AN8dpbYqJC/MuKur.a9kut2aNawBnhvomjLIgQbhB9Vndswm', 'Ricky@gmail.com', '0127945923', 'REN', 'active'),
        ('Low', '$2b$12$78B9oUlv1dHzoO8C10UONet2e2XASdmqaV4hWHrpPr04iG41Lsk9i', 'low123@gmail.com', NULL, 'user', 'active')
        ON CONFLICT (username) DO NOTHING
    """)
    
    print("✅ 示例數據導入完成！")

def main():
    # 數據庫連接信息
    database_url = "postgresql://property_db_mk0k_user:GFL0ceMFr7z9zG2yI7XURfT59SlOP8so@dpg-d2aqb7fdiees73e29qt0-a.singapore-postgres.render.com/property_db_mk0k"
    
    try:
        # 解析數據庫 URL
        db_config = parse_database_url(database_url)
        
        # 連接數據庫
        print("🔗 連接到 PostgreSQL 數據庫...")
        conn = psycopg2.connect(**db_config)
        print("✅ 數據庫連接成功！")
        
        cursor = conn.cursor()
        
        # 創建表結構
        create_tables(cursor)
        
        # 導入示例數據
        import_sample_data(cursor)
        
        conn.commit()
        cursor.close()
        conn.close()
        
        print("🎉 數據庫設置完成！")
        print("\n📋 下一步：")
        print("1. 在 Render Dashboard 中設置環境變量")
        print("2. 重新部署後端服務")
        print("3. 測試應用程序")
        
    except Exception as e:
        print(f"❌ 錯誤: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main() 