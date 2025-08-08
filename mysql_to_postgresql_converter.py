#!/usr/bin/env python3
"""
MySQL to PostgreSQL Converter
將 MySQL dump 文件轉換為 PostgreSQL 格式
"""

import re
import sys
import os

def convert_mysql_to_postgresql(mysql_file, postgres_file):
    """
    將 MySQL dump 文件轉換為 PostgreSQL 格式
    """
    print(f"正在轉換 {mysql_file} 到 {postgres_file}...")
    
    with open(mysql_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 移除 MySQL 特定的註釋和設置
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
    
    # 轉換 AUTO_INCREMENT
    content = re.sub(r'\bAUTO_INCREMENT\b', 'SERIAL', content)
    
    # 轉換 ENGINE 和 CHARSET
    content = re.sub(r'ENGINE=InnoDB.*?;', ';', content)
    content = re.sub(r'DEFAULT CHARSET=.*?;', ';', content)
    content = re.sub(r'COLLATE=.*?;', ';', content)
    
    # 轉換 LOCK TABLES
    content = re.sub(r'LOCK TABLES.*?;', '', content)
    content = re.sub(r'UNLOCK TABLES;', '', content)
    
    # 轉換 DISABLE/ENABLE KEYS
    content = re.sub(r'/\*!40000 ALTER TABLE.*?DISABLE KEYS \*/;', '', content)
    content = re.sub(r'/\*!40000 ALTER TABLE.*?ENABLE KEYS \*/;', '', content)
    
    # 轉換 enum 類型
    def convert_enum(match):
        enum_values = match.group(1)
        return f"VARCHAR(50) CHECK ({match.group(2)} IN ({enum_values}))"
    
    content = re.sub(r'enum\(([^)]+)\)\s+([^,\s]+)', convert_enum, content)
    
    # 轉換 INSERT 語句中的布爾值
    content = re.sub(r"b'0'", 'false', content)
    content = re.sub(r"b'1'", 'true', content)
    content = re.sub(r"'0'", 'false', content)
    content = re.sub(r"'1'", 'true', content)
    
    # 轉換 CURRENT_TIMESTAMP
    content = re.sub(r'CURRENT_TIMESTAMP', 'CURRENT_TIMESTAMP', content)
    
    # 轉換反引號為雙引號
    content = re.sub(r'`([^`]+)`', r'"\1"', content)
    
    # 移除多餘的空行
    content = re.sub(r'\n\s*\n\s*\n', '\n\n', content)
    
    # 添加 PostgreSQL 頭部
    postgres_content = f"""-- PostgreSQL 轉換自 MySQL dump
-- 轉換時間: {os.popen('date').read().strip()}
-- 原始文件: {mysql_file}

{content}
"""
    
    with open(postgres_file, 'w', encoding='utf-8') as f:
        f.write(postgres_content)
    
    print(f"✅ 轉換完成！輸出文件: {postgres_file}")
    print("⚠️  請檢查轉換後的文件，可能需要手動調整一些語法")

def main():
    if len(sys.argv) != 3:
        print("使用方法: python mysql_to_postgresql_converter.py <mysql_file> <postgres_file>")
        print("例如: python mysql_to_postgresql_converter.py mysqldump.sql postgresql_dump.sql")
        sys.exit(1)
    
    mysql_file = sys.argv[1]
    postgres_file = sys.argv[2]
    
    if not os.path.exists(mysql_file):
        print(f"❌ 錯誤: 找不到文件 {mysql_file}")
        sys.exit(1)
    
    convert_mysql_to_postgresql(mysql_file, postgres_file)

if __name__ == "__main__":
    main() 