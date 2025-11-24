# Vercel Deployment Setup Guide

## Environment Variables Configuration

Your application needs Supabase environment variables to work properly. Follow these steps to configure them in Vercel:

### 1. Get Your Supabase Credentials

1. Go to your Supabase project dashboard: https://app.supabase.com
2. Navigate to **Settings** → **API**
3. Copy the following values:
   - **Project URL**: `NEXT_PUBLIC_SUPABASE_URL`
   - **Anon/Public Key**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 2. Add Environment Variables to Vercel

#### Option A: Via Vercel Dashboard

1. Go to your Vercel project: https://vercel.com/dashboard
2. Select your project (NASHK-expense-employee-app)
3. Navigate to **Settings** → **Environment Variables**
4. Add the following variables:

   ```
   Name: NEXT_PUBLIC_SUPABASE_URL
   Value: [Your Supabase Project URL]
   Environment: Production, Preview, Development
   ```

   ```
   Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
   Value: [Your Supabase Anon Key]
   Environment: Production, Preview, Development
   ```

5. Click **Save** for each variable

#### Option B: Via Vercel CLI

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
# Paste your Supabase URL when prompted

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# Paste your Supabase Anon Key when prompted
```

### 3. Redeploy Your Application

After adding environment variables, you need to redeploy:

1. Go to your Vercel project dashboard
2. Navigate to **Deployments** tab
3. Click on the three dots (**...**) next to the latest deployment
4. Select **Redeploy**
5. Wait for the deployment to complete

**OR** simply push a new commit to trigger automatic redeployment:

```bash
git commit --allow-empty -m "chore: trigger redeploy with env vars"
git push origin main
```

### 4. Verify the Setup

1. Visit your deployed application
2. Open browser console (F12)
3. Navigate to the Expenses page
4. Try adding a new expense
5. Check the console for any errors

If you see `Missing Supabase environment variables`, the environment variables are not properly configured in Vercel.

## Common Issues

### Issue: "Application error: a client-side exception has occurred"

**Cause**: Missing or incorrect environment variables in Vercel

**Solution**: 
1. Double-check environment variables in Vercel settings
2. Ensure you're using `NEXT_PUBLIC_` prefix for client-side variables
3. Redeploy after adding/updating variables

### Issue: "Failed to load expenses: Unknown error"

**Cause**: Database connection issue or missing tables

**Solution**:
1. Verify Supabase credentials are correct
2. Check that all tables exist in Supabase (run `supabase-schema.sql`)
3. Verify RLS policies allow access

### Issue: Date-related errors

**Cause**: Date format mismatch between client and database

**Solution**: Already fixed in the latest code - dates are now properly handled

## Local Development Setup

For local development, create a `.env.local` file:

```bash
# Copy the example file
cp .env.example .env.local

# Edit .env.local and add your Supabase credentials
```

**Never commit `.env.local` to Git!** It's already in `.gitignore`.

## Next Steps

Once environment variables are configured:
1. ✅ Expenses will persist after page refresh
2. ✅ Dashboard will show real-time data
3. ✅ All CRUD operations will work properly

## Need Help?

If you continue experiencing issues:
1. Check Vercel deployment logs
2. Check browser console for detailed error messages
3. Verify Supabase connection in the Supabase dashboard
