# 🗄️ 數據庫導入指南

## 📋 概述
本指南將幫助你將 MySQL 數據庫轉換並導入到 PostgreSQL 數據庫中。

## 🎯 步驟

### 第一步：安裝依賴
```bash
pip install -r requirements_converter.txt
```

### 第二步：運行轉換腳本
```bash
python convert_and_import.py
```

### 第三步：檢查結果
腳本會自動：
1. 連接到你的 PostgreSQL 數據庫
2. 轉換 MySQL dump 為 PostgreSQL 格式
3. 創建表結構
4. 導入數據

## 🔧 手動方法（如果自動腳本失敗）

### 方法一：使用在線轉換工具
1. 前往 https://www.sqlines.com/online
2. 選擇 "MySQL to PostgreSQL"
3. 粘貼你的 `mysqldump.sql` 內容
4. 點擊 "Convert"
5. 複製轉換後的 SQL

### 方法二：使用 psql 命令行
```bash
# 連接到數據庫
psql "postgresql://property_db_mk0k_user:GFL0ceMFr7z9zG2yI7XURfT59SlOP8so@dpg-d2aqb7fdiees73e29qt0-a.singapore-postgres.render.com/property_db_mk0k"

# 在 psql 中執行轉換後的 SQL
\i converted_postgresql.sql
```

### 方法三：使用 pgAdmin
1. 下載並安裝 pgAdmin
2. 使用 External Database URL 連接
3. 在查詢工具中執行轉換後的 SQL

## ⚠️ 注意事項

### 常見問題
1. **enum 類型**：PostgreSQL 不支持 enum，會轉換為 VARCHAR + CHECK 約束
2. **AUTO_INCREMENT**：會轉換為 SERIAL
3. **布爾值**：MySQL 的 tinyint(1) 會轉換為 BOOLEAN
4. **字符集**：PostgreSQL 使用 UTF-8

### 需要手動調整的地方
1. 檢查 enum 類型的轉換是否正確
2. 確認外鍵約束是否正確
3. 檢查索引是否正確創建

## 🆘 故障排除

### 錯誤：找不到 psycopg2
```bash
pip install psycopg2-binary
```

### 錯誤：連接失敗
- 檢查數據庫 URL 是否正確
- 確認網絡連接
- 檢查防火牆設置

### 錯誤：語法錯誤
- 檢查轉換後的 SQL 語法
- 可能需要手動調整某些語句

## 📞 支持
如果遇到問題，請檢查：
1. 數據庫連接信息是否正確
2. 網絡連接是否正常
3. 轉換後的 SQL 語法是否正確 