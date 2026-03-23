# Vercel Deployment Fixes

## Issues Fixed

### 1. MongoDB Connection Timeout
- Added proper timeout settings for serverless environment
- Increased `serverSelectionTimeoutMS` to 30 seconds
- Added connection pool configuration
- Prevented process exit in production (serverless doesn't support it)

### 2. Express Trust Proxy Error
- Added `app.set('trust proxy', 1)` before middleware
- This is required for Vercel's proxy infrastructure
- Fixes the `X-Forwarded-For` header validation error

## Next Steps

### 1. Verify MongoDB Connection String in Vercel
Make sure your Vercel environment variable is set correctly:

```bash
# In Vercel Dashboard > Your Project > Settings > Environment Variables
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority
```

**Important MongoDB Atlas Settings:**
- Go to MongoDB Atlas Dashboard
- Navigate to Network Access
- Add `0.0.0.0/0` to IP Whitelist (allows all IPs including Vercel)
- Or add Vercel's IP ranges if you want more security

### 2. Redeploy to Vercel
After committing these changes:

```bash
cd EduX/edux-platform/backend
git add .
git commit -m "Fix: MongoDB timeout and trust proxy for Vercel"
git push
```

Vercel will automatically redeploy.

### 3. Test the Deployment
Once deployed, test these endpoints:
- `https://your-backend.vercel.app/` - Should return API info
- `https://your-backend.vercel.app/api/test` - Should return test message
- `https://your-backend.vercel.app/api/auth/login` - Should accept POST requests

## Common MongoDB Connection Issues

If you still see timeout errors:

1. **Check MongoDB Atlas IP Whitelist**
   - Must include `0.0.0.0/0` or Vercel IPs

2. **Verify Connection String**
   - Must use `mongodb+srv://` protocol
   - Must include database name
   - Password must be URL-encoded if it contains special characters

3. **Check MongoDB Atlas Cluster Status**
   - Ensure cluster is running (not paused)
   - Free tier clusters pause after inactivity

4. **Test Connection String Locally**
   ```bash
   # In backend directory
   node -e "require('mongoose').connect('YOUR_MONGODB_URI').then(() => console.log('Connected')).catch(e => console.error(e))"
   ```

## Monitoring

Check Vercel logs for any remaining issues:
```bash
vercel logs your-project-name --follow
```
