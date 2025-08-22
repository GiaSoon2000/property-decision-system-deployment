# Backend Redeployment Guide

## Issue Summary
The backend is currently returning a 500 error on the `/properties` endpoint due to a database query issue. The error message is:
```
"invalid literal for int() with base 10: 'image_ids'"
```

## Steps to Redeploy

### 1. Commit and Push Changes
```bash
# Navigate to your project directory
cd property-deployment

# Add all changes
git add .

# Commit the changes
git commit -m "Fix properties endpoint database query issue"

# Push to your repository
git push origin main
```

### 2. Redeploy on Render
1. Go to your Render dashboard: https://dashboard.render.com
2. Find your backend service (`property-backend-p69z`)
3. Click on the service
4. Go to the "Manual Deploy" section
5. Click "Deploy latest commit"

### 3. Alternative: Force Redeploy
If the above doesn't work, you can:
1. Go to your backend service on Render
2. Go to "Settings" tab
3. Scroll down to "Build & Deploy"
4. Click "Clear build cache & deploy"

## What Was Fixed

### Backend Changes (`backend/app.py`)
1. **Simplified the properties query** - Removed the complex `STRING_AGG` query that was causing issues
2. **Added better error handling** - The endpoint now checks if tables exist before querying
3. **Separated image fetching** - Images are now fetched in a separate query for each property
4. **Added test endpoint** - `/test-db` endpoint to help debug database issues

### Frontend Changes (`frontend/src/config.js`)
1. **Fixed API URL** - Changed from `localhost:5000` to `https://property-backend-p69z.onrender.com`

## Testing After Deployment

After redeployment, test the endpoints:

```bash
# Test the properties endpoint
curl https://property-backend-p69z.onrender.com/properties

# Test the database connection
curl https://property-backend-p69z.onrender.com/test-db
```

## Expected Results
- `/properties` should return a 200 status with an array of properties
- `/test-db` should return database connection status and table information
- Frontend should load properties without errors

## If Issues Persist
1. Check Render logs for any deployment errors
2. Verify environment variables are set correctly
3. Check if the database is accessible from Render
4. Test database connection manually using the test endpoint
