# ⚡ QUICK FIX GUIDE - Form Submissions

## 🚨 IMMEDIATE ACTION REQUIRED

Your form submissions are currently FAILING. The code fix has been deployed, but you need to apply a database migration.

## ✅ Step-by-Step Fix (5 minutes)

### 1. Open Supabase Dashboard
Go to: https://supabase.com/dashboard

### 2. Select Your Project
Click on your `trsrevos` project

### 3. Open SQL Editor
- Click **SQL Editor** in the left sidebar
- Click **New Query**

### 4. Copy & Paste This SQL
Copy the entire contents of `EMERGENCY_FIX_FORMS.sql` and paste it into the editor.

**Quick copy command:**
```bash
cat EMERGENCY_FIX_FORMS.sql | pbcopy  # Mac
cat EMERGENCY_FIX_FORMS.sql | xclip  # Linux
```

### 5. Run the SQL
Click the **RUN** button (or press Cmd/Ctrl + Enter)

### 6. Verify Success
You should see:
```
ALTER TABLE
COMMENT
DROP POLICY (x4)
CREATE POLICY (x4)
```

## ✅ Test It Works

Try submitting a form:
```bash
curl -X POST http://localhost:3000/api/forms/submit \
  -H "Content-Type: application/json" \
  -d '{
    "formId": "clarity-intake",
    "data": {
      "clientName": "Test Client",
      "monthlyRevenue": 5000,
      "industry": "b2b",
      "goals": "Increase revenue"
    }
  }'
```

**Expected:** Success response with `documentId`, `projectId`, `clientId`

## 🔍 What Was Wrong?

1. **Database column mismatch**: Form API used wrong column name
2. **Security policy**: Required user authentication for public forms

## 📚 Full Details

- **Complete Documentation**: `FORM_SUBMISSION_FIX_DOCUMENTATION.md`
- **Emergency SQL Script**: `EMERGENCY_FIX_FORMS.sql`
- **Migration File**: `supabase/migrations/20251023000000_fix_public_form_submissions.sql`

## ⚠️ CRITICAL

**Do NOT skip the database migration step!** Without it, your forms will still fail even though the code is fixed.

## ✅ After Applying Fix

- ✅ All public forms will work (Clarity, Blueprint, etc.)
- ✅ Clients will be created correctly
- ✅ Projects and documents will be linked
- ✅ No authentication required for public submissions
- ✅ Full error logging enabled

## 🆘 If It Still Doesn't Work

1. Check you ran the SQL in the correct database
2. Check for error messages in the SQL editor
3. Review `FORM_SUBMISSION_FIX_DOCUMENTATION.md` for detailed troubleshooting
4. Check server logs: `pnpm dev` output

---

**Time to fix:** < 5 minutes
**Business impact:** CRITICAL - Unblocks client onboarding
**Next deploy:** Automatic (code already pushed)
