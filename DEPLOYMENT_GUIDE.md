# 🚀 免費部署指南 - Property Buying Decision System

## 📋 部署概覽
- **前端**: React 應用部署到 Render Static Site
- **後端**: Flask API 部署到 Render Web Service  
- **數據庫**: PostgreSQL 部署到 Render Database
- **總成本**: 完全免費

## 🎯 第一步：註冊 Render 帳戶

### 1.1 前往 Render 官網
- 打開瀏覽器，前往: https://render.com
- 點擊右上角的 "Get Started" 或 "Sign Up"

### 1.2 選擇註冊方式
**推薦使用 GitHub 帳戶註冊**:
- 點擊 "Continue with GitHub"
- 授權 Render 訪問你的 GitHub 帳戶
- 完成註冊流程

**或者使用其他方式**:
- 使用 Google 帳戶
- 使用電子郵件註冊

## 🗄️ 第二步：設置數據庫

### 2.1 創建 PostgreSQL 數據庫
1. 在 Render Dashboard 中點擊 "New +"
2. 選擇 "PostgreSQL"
3. 填寫配置信息：
   - **Name**: `property-db`
   - **Database**: `property_db`
   - **User**: `property_user`
   - **Region**: 選擇離你最近的區域
4. 點擊 "Create Database"

### 2.2 記錄數據庫信息
創建完成後，記錄以下信息：
- **Internal Database URL**: `postgresql://property_user:password@host:port/property_db`
- **External Database URL**: `postgresql://property_user:password@host:port/property_db`
- **Database Name**: `property_db`
- **User**: `property_user`
- **Password**: 自動生成的密碼

### 2.3 導入數據
1. 在數據庫詳情頁面，點擊 "Connect" 標籤
2. 使用提供的連接信息連接到數據庫
3. 導入 `mysqldump.sql` 文件（需要轉換為 PostgreSQL 格式）

## 🔧 第三步：部署後端 API

### 3.1 連接 GitHub 倉庫
1. 在 Render Dashboard 中點擊 "New +"
2. 選擇 "Web Service"
3. 連接你的 GitHub 帳戶（如果還沒連接）
4. 選擇包含你的代碼的倉庫

### 3.2 配置部署設置
填寫以下信息：
- **Name**: `property-backend`
- **Environment**: `Python 3`
- **Region**: 選擇與數據庫相同的區域
- **Branch**: `main` 或 `master`
- **Root Directory**: `backend`（如果後端代碼在 backend 文件夾中）
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `hypercorn app:app --bind 0.0.0.0:$PORT`

### 3.3 設置環境變量
點擊 "Environment" 標籤，添加以下變量：

```
MYSQL_HOST=your-database-host
MYSQL_USER=your-database-user
MYSQL_PASSWORD=your-database-password
MYSQL_DB=your-database-name
OPENAI_API_KEY=your-openai-api-key
FLASK_SECRET_KEY=your-secret-key
```

**注意**: 
- 將 `your-database-host` 等替換為實際的數據庫信息
- `OPENAI_API_KEY` 需要從 OpenAI 平台獲取
- `FLASK_SECRET_KEY` 可以是任意字符串

### 3.4 部署
1. 點擊 "Create Web Service"
2. 等待部署完成（通常需要 5-10 分鐘）
3. 記錄生成的 URL，例如：`https://property-backend.onrender.com`

## 🎨 第四步：部署前端

### 4.1 創建靜態網站
1. 在 Render Dashboard 中點擊 "New +"
2. 選擇 "Static Site"
3. 連接同一個 GitHub 倉庫

### 4.2 配置部署設置
填寫以下信息：
- **Name**: `property-frontend`
- **Branch**: `main` 或 `master`
- **Build Command**: `cd frontend/property-app-frontend && npm install && npm run build`
- **Publish Directory**: `frontend/property-app-frontend/build`

### 4.3 設置環境變量
點擊 "Environment" 標籤，添加：
```
REACT_APP_API_URL=https://your-backend-url.onrender.com
```

**注意**: 將 `your-backend-url` 替換為實際的後端 URL

### 4.4 部署
1. 點擊 "Create Static Site"
2. 等待部署完成
3. 記錄生成的 URL，例如：`https://property-frontend.onrender.com`

## 🔄 第五步：更新 CORS 設置

### 5.1 更新後端 CORS
在 `backend/app.py` 中，將 CORS 設置更新為：
```python
CORS(app, origins=[
    'http://localhost:3000', 
    'https://your-frontend-domain.onrender.com'
], supports_credentials=True, methods=['GET', 'POST', 'OPTIONS', 'DELETE', 'PUT'])
```

### 5.2 重新部署
1. 提交更改到 GitHub
2. Render 會自動重新部署

## 🧪 第六步：測試部署

### 6.1 測試前端
1. 訪問前端 URL
2. 檢查頁面是否正常加載
3. 測試登錄功能

### 6.2 測試後端
1. 訪問後端 URL + `/`，應該看到歡迎信息
2. 測試 API 端點

### 6.3 測試數據庫連接
1. 檢查後端日誌是否有數據庫連接錯誤
2. 測試數據庫查詢功能

## 🔧 故障排除

### 常見問題

**1. 後端部署失敗**
- 檢查 `requirements.txt` 是否包含所有依賴
- 檢查環境變量是否正確設置
- 查看部署日誌

**2. 前端無法連接後端**
- 檢查 `REACT_APP_API_URL` 環境變量
- 確認後端 URL 是否正確
- 檢查 CORS 設置

**3. 數據庫連接失敗**
- 確認數據庫憑證是否正確
- 檢查數據庫是否在運行
- 確認網絡連接

**4. 圖片無法顯示**
- 檢查圖片路徑是否正確
- 確認靜態文件服務是否正常

## 📞 獲取幫助

如果遇到問題：
1. 檢查 Render 部署日誌
2. 查看 GitHub 倉庫的 Issues
3. 在 Render 社區論壇尋求幫助

## 🎉 完成！

部署完成後，你的應用將可以通過以下 URL 訪問：
- **前端**: `https://your-frontend-name.onrender.com`
- **後端**: `https://your-backend-name.onrender.com`

恭喜！你的 Property Buying Decision System 現在已經成功部署到雲端了！ 