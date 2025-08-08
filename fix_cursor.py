#!/usr/bin/env python3
"""
修復 PostgreSQL cursor 問題的腳本
將所有 cursor(dictionary=True) 替換為 cursor()
"""

import re
import os

def fix_cursor_issues(file_path):
    """修復文件中的 cursor 問題"""
    print(f"修復文件: {file_path}")
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 替換 cursor(dictionary=True) 為 cursor()
    original_content = content
    content = re.sub(r'cursor\(dictionary=True\)', 'cursor()', content)
    
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
        fix_cursor_issues(app_file)
    
    print("🎉 修復完成！")

if __name__ == "__main__":
    main() 