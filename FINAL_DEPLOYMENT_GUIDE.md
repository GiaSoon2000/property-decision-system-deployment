# 🚀 最終部署指南 - Property Decision System

## 📋 部署概覽
- **前端**: React 應用部署到 Render Static Site
- **後端**: Flask API 部署到 Render Web Service  
- **數據庫**: PostgreSQL 部署到 Render Database
- **總成本**: 完全免費

## 🎯 第一步：數據庫設置

### 1.1 數據庫已創建
✅ PostgreSQL 數據庫已創建：
- **數據庫名稱**: `property_db_mk0k`
- **用戶**: `property_db_mk0k_user`
- **密碼**: `GFL0ceMFr7z9zG2yI7XURfT59SlOP8so`
- **主機**: `dpg-d2aqb7fdiees73e29qt0-a.singapore-postgres.render.com`

### 1.2 數據庫結構已設置
✅ 表結構已創建：
- `users` - 用戶表
- `profiles` - 用戶資料表
- `properties` - 房產表
- `pending_properties` - 待審核房產表
- `notifications` - 通知表
- `property_images` - 房產圖片表
- `user_favorites` - 用戶收藏表

## 🔧 第二步：部署後端

### 2.1 在 Render Dashboard 中
1. 前往 https://dashboard.render.com
2. 點擊 "New +" → "Web Service"
3. 連接 GitHub 帳戶（如果還沒連接）
4. 選擇倉庫：`GiaSoon2000/property-decision-system-deployment`

### 2.2 配置設置
填寫以下信息：
- **Name**: `property-backend`
- **Environment**: `Python 3`
- **Region**: 選擇離你最近的區域
- **Branch**: `main`
- **Root Directory**: `backend`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `hypercorn app:app --bind 0.0.0.0:$PORT`

### 2.3 設置環境變量
在 "Environment" 標籤中添加：
```
DATABASE_URL=postgresql://property_db_mk0k_user:GFL0ceMFr7z9zG2yI7XURfT59SlOP8so@dpg-d2aqb7fdiees73e29qt0-a.singapore-postgres.render.com/property_db_mk0k
OPENAI_API_KEY=your-openai-api-key-here
FLASK_SECRET_KEY=your-secret-key-here
```

### 2.4 部署
1. 點擊 "Create Web Service"
2. 等待部署完成
3. 記錄生成的 URL（例如：`https://property-backend-xxxx.onrender.com`）

## 🎨 第三步：部署前端

### 3.1 在 Render Dashboard 中
1. 點擊 "New +" → "Static Site"
2. 選擇同一個 GitHub 倉庫

### 3.2 配置設置
填寫以下信息：
- **Name**: `property-frontend`
- **Branch**: `main`
- **Root Directory**: `frontend/property-app-frontend`
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `build`

### 3.3 設置環境變量
在 "Environment" 標籤中添加：
```
REACT_APP_API_URL=https://property-backend-xxxx.onrender.com
```
（將 `xxxx` 替換為你的實際後端服務名稱）

### 3.4 部署
1. 點擊 "Create Static Site"
2. 等待部署完成
3. 記錄生成的 URL（例如：`https://property-frontend-xxxx.onrender.com`）

## 🔗 第四步：更新 CORS 設置

### 4.1 更新後端 CORS
在 `backend/app.py` 中更新 CORS 設置：
```python
CORS(app, origins=[
    'http://localhost:3000', 
    'https://property-frontend-xxxx.onrender.com'
], supports_credentials=True, methods=['GET', 'POST', 'OPTIONS', 'DELETE', 'PUT'])
```

### 4.2 重新部署
1. 提交更改到 GitHub
2. 在 Render Dashboard 中重新部署後端服務

## 🧪 第五步：測試應用

### 5.1 測試後端 API
訪問：`https://property-backend-xxxx.onrender.com/`
應該看到："Welcome to the Property Buying Decision System API"

### 5.2 測試前端
訪問：`https://property-frontend-xxxx.onrender.com/`
應該看到你的 React 應用

### 5.3 測試數據庫連接
1. 嘗試註冊新用戶
2. 嘗試登錄
3. 檢查數據是否正確保存到 PostgreSQL

## 🆘 故障排除

### 常見問題

#### 1. 後端部署失敗
- 檢查 `requirements.txt` 是否包含所有依賴
- 檢查環境變量是否正確設置
- 查看 Render 日誌

#### 2. 前端部署失敗
- 檢查 `package.json` 是否包含所有依賴
- 檢查 `REACT_APP_API_URL` 是否正確設置
- 查看 Render 日誌

#### 3. 數據庫連接失敗
- 檢查 `DATABASE_URL` 是否正確
- 確認數據庫服務是否運行
- 檢查網絡連接

#### 4. CORS 錯誤
- 確認前端 URL 已添加到後端 CORS 設置
- 重新部署後端服務

## 📞 支持

### 有用的鏈接
- **Render Dashboard**: https://dashboard.render.com
- **GitHub 倉庫**: https://github.com/GiaSoon2000/property-decision-system-deployment
- **PostgreSQL 文檔**: https://www.postgresql.org/docs/

### 聯繫方式
如果遇到問題，請檢查：
1. 所有環境變量是否正確設置
2. 數據庫連接是否正常
3. 前端和後端 URL 是否正確配置

## 🎉 完成！

恭喜！你的 Property Decision System 已經成功部署到 Render 平台。

### 最終 URL
- **前端**: `https://property-frontend-xxxx.onrender.com`
- **後端**: `https://property-backend-xxxx.onrender.com`
- **數據庫**: PostgreSQL on Render

### 下一步
1. 測試所有功能
2. 添加更多數據
3. 配置自定義域名（可選）
4. 設置監控和日誌 