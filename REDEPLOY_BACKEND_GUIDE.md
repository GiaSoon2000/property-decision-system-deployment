# Backend Redeployment Guide

## Issue Summary
The backend `/properties` endpoint is currently returning placeholder data (e.g., `{"id":"id", "name":"name", ...}`) instead of actual property data. This is due to a bug in the data processing code that has been fixed locally but needs to be deployed to Render.

## Fix Applied
The issue was in `backend/app.py` in the `get_properties()` function. The code was incorrectly processing data from `RealDictCursor`:

**Before (Problematic):**
```python
columns = [desc[0] for desc in cursor.description]
properties_dict = []

for row in properties:
    property_dict = dict(zip(columns, row))  # This was wrong!
```

**After (Fixed):**
```python
properties_dict = []

for row in properties:
    property_dict = dict(row)  # RealDictCursor already returns dict, just make a copy
```

## Redeployment Steps

### 1. Commit Your Changes
Make sure all your local changes are committed to your Git repository:

```bash
git add .
git commit -m "Fix properties endpoint data processing issue"
git push origin main
```

### 2. Redeploy on Render

#### Option A: Automatic Redeployment (Recommended)
If your Render service is connected to your Git repository:
1. Go to your Render dashboard: https://dashboard.render.com/
2. Find your backend service (likely named something like "property-backend-p69z")
3. Click on the service
4. Go to the "Manual Deploy" section
5. Click "Deploy latest commit" or "Redeploy"

#### Option B: Manual Redeployment
If automatic deployment is not working:
1. Go to your Render dashboard
2. Find your backend service
3. Go to "Settings" tab
4. Scroll down to "Build & Deploy" section
5. Click "Clear build cache & deploy"

### 3. Verify Deployment
After redeployment, test the endpoints:

```bash
# Test the properties endpoint
curl https://property-backend-p69z.onrender.com/properties

# Test the database connection
curl https://property-backend-p69z.onrender.com/test-db
```

### 4. Expected Results
After successful redeployment, the `/properties` endpoint should return actual property data instead of placeholder values.

## Troubleshooting

### If redeployment fails:
1. Check the build logs in Render dashboard
2. Ensure all dependencies are in `requirements.txt`
3. Verify environment variables are set correctly

### If the issue persists:
1. Check if the deployment actually completed successfully
2. Verify the build logs show the latest code changes
3. Test the endpoints again after a few minutes (deployment can take time)

## Environment Variables
Ensure these environment variables are set in your Render service:
- `DATABASE_URL`: Your PostgreSQL connection string
- `OPENAI_API_KEY`: Your OpenAI API key (if using AI features)

## Contact
If you continue to have issues after following this guide, please provide:
1. The build logs from Render
2. The current response from `/properties` endpoint
3. Any error messages you see
