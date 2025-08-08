#!/bin/bash

echo "🚀 Property Buying Decision System 部署腳本"
echo "=========================================="

# 檢查是否在正確的目錄
if [ ! -f "backend/app.py" ]; then
    echo "❌ 錯誤: 請在項目根目錄運行此腳本"
    exit 1
fi

echo "📋 檢查必要文件..."

# 檢查必要文件
if [ ! -f "backend/requirements.txt" ]; then
    echo "❌ 錯誤: backend/requirements.txt 不存在"
    exit 1
fi

if [ ! -f "frontend/property-app-frontend/package.json" ]; then
    echo "❌ 錯誤: frontend/package.json 不存在"
    exit 1
fi

echo "✅ 所有必要文件存在"

echo ""
echo "🎯 部署步驟:"
echo "1. 註冊 Render 帳戶: https://render.com"
echo "2. 創建 PostgreSQL 數據庫"
echo "3. 部署後端 API"
echo "4. 部署前端應用"
echo "5. 配置環境變量"
echo "6. 測試部署"

echo ""
echo "📖 詳細指南請查看 DEPLOYMENT_GUIDE.md"
echo ""
echo "🔗 重要鏈接:"
echo "- Render 官網: https://render.com"
echo "- GitHub 倉庫: 請確保代碼已推送到 GitHub"
echo "- OpenAI API: https://platform.openai.com/api-keys"

echo ""
echo "💡 提示:"
echo "- 確保你的代碼已經推送到 GitHub"
echo "- 準備好 OpenAI API Key"
echo "- 記錄所有生成的 URL 和密碼"

echo ""
echo "🎉 準備開始部署！" 