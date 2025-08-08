#!/usr/bin/env python3
"""
MySQL to PostgreSQL 轉換和導入腳本
專門為 Property Decision System 設計
"""

import re
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

def convert_mysql_to_postgresql(mysql_file):
    """將 MySQL dump 轉換為 PostgreSQL 格式"""
    print(f"🔄 正在轉換 {mysql_file}...")
    
    with open(mysql_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 移除 MySQL 特定註釋
    content = re.sub(r'/\*!.*?\*/;?\s*', '', content, flags=re.DOTALL)
    content = re.sub(r'-- MySQL dump.*?\n', '', content)
    content = re.sub(r'-- Server version.*?\n', '', content)
    content = re.sub(r'-- Host:.*?\n', '', content)
    content = re.sub(r'-- Database:.*?\n', '', content)
    content = re.sub(r'-- ------------------------------------------------------\n', '', content)
    
    # 轉換數據類型
    content = re.sub(r'\bint\b', 'INTEGER', content)
    content = re.sub(r'\btinyint\(1\)\b', 'BOOLEAN', content)
    content = re.sub(r'\bdecimal\((\d+),(\d+)\)\b', r'NUMERIC(\1,\2)', content)
    content = re.sub(r'\bfloat\b', 'REAL', content)
    content = re.sub(r'\btext\b', 'TEXT', content)
    content = re.sub(r'\bvarchar\((\d+)\)\b', r'VARCHAR(\1)', content)
    content = re.sub(r'\btimestamp\b', 'TIMESTAMP', content)
    content = re.sub(r'\bdatetime\b', 'TIMESTAMP', content)
    
    # 轉換 AUTO_INCREMENT 為 SERIAL（修復語法）
    content = re.sub(r'INTEGER NOT NULL AUTO_INCREMENT', 'SERIAL', content)
    content = re.sub(r'INTEGER NOT NULL SERIAL', 'SERIAL', content)
    
    # 移除 MySQL 特定語法
    content = re.sub(r'ENGINE=InnoDB.*?;', ';', content)
    content = re.sub(r'DEFAULT CHARSET=.*?;', ';', content)
    content = re.sub(r'COLLATE=.*?;', ';', content)
    content = re.sub(r'LOCK TABLES.*?;', '', content)
    content = re.sub(r'UNLOCK TABLES;', '', content)
    content = re.sub(r'/\*!40000 ALTER TABLE.*?DISABLE KEYS \*/;', '', content)
    content = re.sub(r'/\*!40000 ALTER TABLE.*?ENABLE KEYS \*/;', '', content)
    
    # 轉換 enum 類型
    def convert_enum(match):
        enum_values = match.group(1)
        column_name = match.group(2)
        return f'VARCHAR(50) CHECK ({column_name} IN ({enum_values}))'
    
    content = re.sub(r'enum\(([^)]+)\)\s+([^,\s]+)', convert_enum, content)
    
    # 轉換布爾值
    content = re.sub(r"b'0'", 'false', content)
    content = re.sub(r"b'1'", 'true', content)
    content = re.sub(r"'0'", 'false', content)
    content = re.sub(r"'1'", 'true', content)
    
    # 轉換反引號為雙引號
    content = re.sub(r'`([^`]+)`', r'"\1"', content)
    
    # 移除多餘空行和註釋
    content = re.sub(r'\n\s*\n\s*\n', '\n\n', content)
    content = re.sub(r'--.*?\n', '\n', content)
    
    # 移除 UNLOCK TABLES 相關內容
    content = re.sub(r'UNLOCK TABLES;.*?', '', content, flags=re.DOTALL)
    
    return content

def create_tables_and_import_data(conn, postgres_content):
    """創建表並導入數據"""
    cursor = conn.cursor()
    
    # 分割 SQL 語句（更智能的分割）
    statements = []
    current_statement = ""
    
    for line in postgres_content.split('\n'):
        line = line.strip()
        if not line or line.startswith('--'):
            continue
        
        current_statement += line + " "
        
        if line.endswith(';'):
            statements.append(current_statement.strip())
            current_statement = ""
    
    # 添加最後一個語句（如果沒有分號）
    if current_statement.strip():
        statements.append(current_statement.strip())
    
    for statement in statements:
        if not statement or len(statement) < 10:
            continue
        
        try:
            cursor.execute(statement)
            print(f"✅ 執行: {statement[:50]}...")
        except Exception as e:
            print(f"⚠️  跳過語句: {statement[:50]}...")
            print(f"   錯誤: {str(e)[:100]}")
            continue
    
    conn.commit()
    cursor.close()
    print("✅ 數據庫結構和數據導入完成！")

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
        
        # 轉換 MySQL dump
        mysql_file = "mysqldump.sql"
        if not os.path.exists(mysql_file):
            print(f"❌ 找不到文件: {mysql_file}")
            sys.exit(1)
        
        postgres_content = convert_mysql_to_postgresql(mysql_file)
        
        # 創建表和導入數據
        print("📊 創建表結構並導入數據...")
        create_tables_and_import_data(conn, postgres_content)
        
        conn.close()
        print("🎉 所有操作完成！")
        
    except Exception as e:
        print(f"❌ 錯誤: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main() 