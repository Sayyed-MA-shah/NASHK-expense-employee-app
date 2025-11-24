# Supabase Database Setup Guide

## 📋 Prerequisites
- Supabase account created
- Project already integrated with Vercel
- Supabase project URL and Anon Key available

---

## 🚀 Setup Steps

### Step 1: Get Your Supabase Credentials

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Click on **Settings** (gear icon) → **API**
4. Copy the following:
   - **Project URL** (under Project URL)
   - **Anon/Public Key** (under Project API keys)

### Step 2: Configure Environment Variables

#### **For Local Development:**

1. Open the file `.env.local` in the root of your dashboard folder
2. Replace the placeholder values:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

#### **For Vercel (Production):**

1. Go to your Vercel Dashboard: https://vercel.com
2. Select your **NASHK-expense-employee-app** project
3. Go to **Settings** → **Environment Variables**
4. Add these two variables:
   - **Key:** `NEXT_PUBLIC_SUPABASE_URL`  
     **Value:** Your Supabase Project URL
   - **Key:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`  
     **Value:** Your Supabase Anon Key
5. Make sure they are available for all environments (Production, Preview, Development)
6. Click **Save**

### Step 3: Create Database Tables

1. Go to your Supabase Dashboard
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**
4. Open the file `supabase-schema.sql` from your project root
5. Copy the entire SQL content
6. Paste it into the Supabase SQL Editor
7. Click **Run** or press `Ctrl/Cmd + Enter`
8. Wait for the success message: "Success. No rows returned"

### Step 4: Verify Database Setup

1. In Supabase, click on **Table Editor** in the left sidebar
2. You should see these tables:
   - ✅ `employees`
   - ✅ `work_records`
   - ✅ `salary_payments`
   - ✅ `advances`
   - ✅ `overtime_records`
   - ✅ `payments`
   - ✅ `expenses`

3. Click on **Database** → **Views** to see:
   - ✅ `employee_statistics`
   - ✅ `payment_statistics`
   - ✅ `expense_statistics`

### Step 5: Test the Connection

Run your development server:
```bash
npm run dev
```

The application should now connect to your Supabase database!

---

## 📊 Database Schema Overview

### Tables Created:

1. **employees** - Store both contractual and fixed salary employees
2. **work_records** - Track work done by contractual employees
3. **salary_payments** - Record all salary payments
4. **advances** - Track advance payments to employees
5. **overtime_records** - Track overtime for fixed employees
6. **payments** - Store all payin/payout transactions
7. **expenses** - Manage company expenses

### Features Enabled:

- ✅ UUID primary keys for all tables
- ✅ Automatic timestamp updates
- ✅ Foreign key relationships
- ✅ Indexes for performance
- ✅ Row Level Security (RLS) enabled
- ✅ Statistics views for dashboard KPIs

---

## 🔄 Next Steps

After completing the setup:

1. **Redeploy on Vercel:**
   - Go to your Vercel project
   - Click **Deployments**
   - Click the **Redeploy** button on the latest deployment
   - This ensures environment variables are loaded

2. **Test the Application:**
   - Add a new employee
   - Create a payment entry
   - Add an expense
   - Verify data is saved in Supabase

3. **Monitor Database:**
   - Use Supabase Table Editor to view data
   - Check the logs in **Database** → **Logs**

---

## ⚠️ Important Security Notes

### Current RLS Policies:
The database is currently set with **open access policies** for development. Before going to production:

1. Implement proper authentication (Supabase Auth)
2. Update RLS policies to restrict access based on user roles
3. Consider adding user management

### Example RLS Policy Update (for future):
```sql
-- Replace the open policy with user-specific access
DROP POLICY "Allow all access to employees" ON employees;

CREATE POLICY "Users can view employees" ON employees
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage employees" ON employees
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
```

---

## 🐛 Troubleshooting

### Issue: "Missing Supabase environment variables"
- **Solution:** Make sure `.env.local` is created and contains valid credentials
- Restart your dev server after adding environment variables

### Issue: Tables not showing in Supabase
- **Solution:** Re-run the SQL schema file in Supabase SQL Editor
- Check for any SQL errors in the output

### Issue: Data not saving
- **Solution:** Check browser console for errors
- Verify environment variables are set correctly
- Check Supabase logs for API errors

### Issue: Vercel deployment not connecting
- **Solution:** Verify environment variables are set in Vercel
- Redeploy the application
- Check Vercel deployment logs

---

## 📞 Support

If you encounter issues:
1. Check Supabase logs: **Database** → **Logs**
2. Check browser console for errors
3. Verify all environment variables are set correctly

---

## ✅ Setup Checklist

- [ ] Supabase credentials copied
- [ ] `.env.local` file updated
- [ ] Vercel environment variables configured
- [ ] SQL schema executed in Supabase
- [ ] All tables created successfully
- [ ] Application connects to database
- [ ] Vercel redeployed with new env vars
- [ ] Test data entry working

---

**Database Version:** 1.0.0  
**Last Updated:** November 24, 2025  
**Schema File:** `supabase-schema.sql`
