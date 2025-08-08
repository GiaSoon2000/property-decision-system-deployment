#!/usr/bin/env python3
"""
修復 PostgreSQL 語法問題的腳本
將 MySQL 語法轉換為 PostgreSQL 語法
"""

import re
import os

def fix_postgresql_syntax(file_path):
    """修復文件中的 PostgreSQL 語法問題"""
    print(f"修復文件: {file_path}")
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # 修復 GROUP_CONCAT 為 STRING_AGG
    content = re.sub(r'GROUP_CONCAT\(DISTINCT ([^)]+)\)', r'STRING_AGG(DISTINCT \1::text, \',\')', content)
    content = re.sub(r'GROUP_CONCAT\(([^)]+)\)', r'STRING_AGG(\1::text, \',\')', content)
    
    # 修復 %s 參數佔位符為 %s（PostgreSQL 也支持）
    # 但需要確保使用正確的參數化查詢
    
    # 修復其他可能的 MySQL 特定語法
    content = re.sub(r'LIMIT \d+ OFFSET \d+', lambda m: m.group(0), content)  # 保持不變
    
    # 如果內容有變化，寫回文件
    if content != original_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✅ 已修復 {file_path}")
        return True
    else:
        print(f"⚠️  無需修復 {file_path}")
        return False

def main():
    # 修復主要的 app.py 文件
    app_file = "backend/app.py"
    if os.path.exists(app_file):
        fix_postgresql_syntax(app_file)
    
    print("🎉 PostgreSQL 語法修復完成！")

if __name__ == "__main__":
    main() 