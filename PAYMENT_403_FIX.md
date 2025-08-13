# 🔧 Fixing the 403 Forbidden Error

## 🚨 Problem Description
Your application is experiencing a `403 (Forbidden)` error when calling `/api/download/create-token`. This error occurs because the payment status in the database is not being updated after successful Stripe payments.

## 🔍 Root Cause
The `SUPABASE_SERVICE_ROLE_KEY` environment variable is missing from your configuration. This key is required for the `/api/session-status` endpoint to update the `is_paid` field in the database when payments are completed.

## 🛠️ How to Fix

### Step 1: Get Your Supabase Service Role Key
1. Go to your [Supabase project dashboard](https://supabase.com/dashboard)
2. Navigate to **Settings** → **API**
3. Look for the **service_role** key (this is different from the anon key)
4. Copy the entire key value

### Step 2: Add the Key to Your Environment
1. Open your `.env.local` file
2. Add this line:
   ```
   SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key_here
   ```
3. Replace `your_actual_service_role_key_here` with the key you copied

### Step 3: Restart Your Development Server
```bash
# Stop your current dev server (Ctrl+C)
# Then restart it
npm run dev
```

## 🔍 Verify the Fix

Run the configuration check script to ensure all variables are set:
```bash
npm run check-config
```

You should see:
```
✅ SUPABASE_SERVICE_ROLE_KEY: ***SET***
   Supabase service role key (REQUIRED for payment updates)
```

## 🧪 Test the Fix

1. Upload a photo and process it
2. Complete the payment through Stripe
3. The system should now automatically create a download token
4. No more 403 errors!

## 📋 What Was Fixed

1. **Environment Variable**: Added missing `SUPABASE_SERVICE_ROLE_KEY`
2. **Error Handling**: Improved error messages and added retry functionality
3. **User Experience**: Added manual retry button for payment-related errors
4. **Logging**: Enhanced logging to make debugging easier

## 🔄 How It Works Now

1. User completes payment → Stripe redirects back
2. Frontend calls `/api/session-status` with session ID
3. Backend uses service role key to update `is_paid: true` in database
4. Frontend can now successfully create download tokens
5. If there's still a delay, user can manually retry

## 🚀 Additional Improvements Made

- **Retry Mechanism**: Automatic retries with exponential backoff
- **Better Error Messages**: Clear Japanese error messages for users
- **Manual Retry Button**: Users can manually retry if automatic retries fail
- **Configuration Checker**: Script to verify all environment variables are set

## 📞 Still Having Issues?

If you continue to experience problems after adding the service role key:

1. Check the browser console for detailed error messages
2. Verify the key is correctly copied (no extra spaces)
3. Ensure your Supabase project has the correct table structure
4. Check that RLS policies allow the service role to update records

## 🔐 Security Note

The service role key has full access to your database. Keep it secure and never expose it in client-side code. It's only used in server-side API routes.
