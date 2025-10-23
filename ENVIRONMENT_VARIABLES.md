# Environment Variables Configuration

**Last Updated:** October 23, 2025
**Status:** ✅ Synced across Local, Netlify, and Supabase

---

## Overview

This document tracks all environment variables used across different environments to ensure consistency between local development, production (Netlify), and Supabase.

---

## Required Environment Variables

### Supabase Configuration

| Variable | Description | Where Used | Status |
|----------|-------------|------------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Local, Netlify | ✅ Synced |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key for client-side | Local, Netlify | ✅ Synced |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret service role key for server-side operations | Local, Netlify | ✅ **FIXED Oct 23** |

**Current Values:**
- **URL:** `https://itolyllbvbdorqapuhyj.supabase.co`
- **Project ID:** `itolyllbvbdorqapuhyj`
- **Dashboard:** https://supabase.com/dashboard/project/itolyllbvbdorqapuhyj

### OpenAI Configuration

| Variable | Description | Where Used | Status |
|----------|-------------|------------|--------|
| `OPENAI_API_KEY` | OpenAI API key for TRS Brain chat | Local, Netlify | ✅ Synced |

**Used For:**
- TRS Brain chat functionality
- AI-powered content generation
- Form analysis and insights

### News API Configuration

| Variable | Description | Where Used | Status |
|----------|-------------|------------|--------|
| `NEXT_PUBLIC_NEWS_API_KEY` | News API key for news feed | Local, Netlify | ✅ **ADDED Oct 23** |

**Used For:**
- News feed in dashboard
- Industry insights
- Free tier: 100 requests/day

---

## Environment-Specific Setup

### Local Development (.env.local)

**Location:** `/Users/jayburgess/CODING/trsrevos/.env.local`

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://itolyllbvbdorqapuhyj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# OpenAI Configuration
OPENAI_API_KEY=sk-proj-...

# News API Configuration
NEXT_PUBLIC_NEWS_API_KEY=701270ea1f7d40a0a2329262a847dbc7
```

### Production (Netlify)

**Site:** trsrevos
**URL:** https://app.therevenuescientists.com
**Dashboard:** https://app.netlify.com/projects/trsrevos

**Environment Variables Set:**
1. ✅ `NEXT_PUBLIC_SUPABASE_URL`
2. ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. ✅ `SUPABASE_SERVICE_ROLE_KEY` ← **CRITICAL: Added Oct 23, 2025**
4. ✅ `OPENAI_API_KEY`
5. ✅ `NEXT_PUBLIC_NEWS_API_KEY` ← **Added Oct 23, 2025**
6. ⚙️ `NODE_VERSION` (build setting)
7. ⚙️ `NPM_FLAGS` (build setting)

**How to Update Netlify Env Vars:**

```bash
# Option 1: Via Netlify CLI (recommended)
netlify env:set VARIABLE_NAME "value"

# Option 2: Via Netlify Dashboard
# 1. Go to https://app.netlify.com/projects/trsrevos
# 2. Site settings → Environment variables
# 3. Add/Edit variables
# 4. Trigger new deploy
```

### Supabase

**Project Dashboard:** https://supabase.com/dashboard/project/itolyllbvbdorqapuhyj

**Getting API Keys:**
1. Go to Project Settings → API
2. Copy Project URL and anon/public key
3. **Never commit service_role key to git!**

---

## Critical Issues Fixed (Oct 23, 2025)

### Issue: Forms Failing on Production

**Problem:**
- Forms worked on localhost but failed on https://app.therevenuescientists.com
- Error: "Something went wrong. Please try again or contact us directly."

**Root Cause:**
- Missing `SUPABASE_SERVICE_ROLE_KEY` in Netlify environment variables
- Form submission API requires this key to bypass RLS for public form submissions

**Solution:**
1. ✅ Added `SUPABASE_SERVICE_ROLE_KEY` to Netlify
2. ✅ Added `NEXT_PUBLIC_NEWS_API_KEY` to Netlify
3. ✅ Triggered new deployment
4. ✅ Verified environment variables match across all environments

**Deployment Status:**
- Commit: `93dc846`
- Deployed: Oct 23, 2025 ~03:30 UTC
- Build: ✅ Successful (60/60 pages)

---

## Security Best Practices

### Public vs Secret Keys

**Public Keys (Safe to Expose):**
- ✅ `NEXT_PUBLIC_SUPABASE_URL` - prefix `NEXT_PUBLIC_` makes it client-side
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` - designed for public use with RLS
- ✅ `NEXT_PUBLIC_NEWS_API_KEY` - rate-limited, safe to expose

**Secret Keys (NEVER EXPOSE):**
- ⛔ `SUPABASE_SERVICE_ROLE_KEY` - bypass RLS, full database access
- ⛔ `OPENAI_API_KEY` - billable API access

### .gitignore Protection

```bash
# Already in .gitignore
.env.local
.env
.env*.local
.netlify/
```

**Never commit:**
- `.env.local` files
- Service role keys
- API keys with billing

---

## Testing Environment Variables

### Local Testing

```bash
# Check if env vars are loaded
pnpm dev

# Look for this in terminal:
# "- Environments: .env.local"

# Test form submission
curl -X POST http://localhost:3000/api/forms/submit \
  -H "Content-Type: application/json" \
  -d '{"formId":"clarity-intake","data":{"clientName":"Test"}}'
```

### Production Testing

```bash
# Test production form API
curl -X POST https://app.therevenuescientists.com/api/forms/submit \
  -H "Content-Type: application/json" \
  -d '{"formId":"clarity-intake","data":{"clientName":"Test"}}'

# Should return:
# {"success":true,"message":"Form submitted successfully",...}
```

### Verification Checklist

- [ ] Local `.env.local` file exists and has all 4 keys
- [ ] Netlify has all 7 environment variables configured
- [ ] Supabase project URL matches in all environments
- [ ] Forms submit successfully on localhost
- [ ] Forms submit successfully on production
- [ ] No CORS errors in browser console
- [ ] Database receives form submissions (check Supabase table editor)

---

## Troubleshooting

### Form Submissions Fail

**Symptoms:**
- "Something went wrong" error
- Forms work on localhost but not production
- API returns 500 error

**Check:**
1. Netlify environment variables are set
2. `SUPABASE_SERVICE_ROLE_KEY` is present in Netlify
3. Recent deployment completed successfully
4. Browser console for detailed errors

**Fix:**
```bash
# Re-add environment variable
netlify env:set SUPABASE_SERVICE_ROLE_KEY "your-key-here"

# Trigger new deployment
git commit --allow-empty -m "Trigger deployment"
git push origin main
```

### Environment Variable Not Loading

**Check Build Logs:**
1. Go to Netlify Dashboard → Deploys
2. Click latest deploy
3. Check "Deploy log"
4. Look for environment variable warnings

**Common Issues:**
- Variable set in wrong context (dev vs production)
- Typo in variable name
- Missing quotes in value
- Need to redeploy after adding variables

---

## Maintenance

### When Adding New Environment Variables

1. **Add to `.env.local`** (local development)
2. **Add to Netlify** (production)
   ```bash
   netlify env:set NEW_VARIABLE "value"
   ```
3. **Update this document**
4. **Trigger deployment**
5. **Test on production**

### When Rotating Keys

1. **Generate new key** (in Supabase/OpenAI/etc)
2. **Update local** `.env.local`
3. **Update Netlify**
   ```bash
   netlify env:set VARIABLE_NAME "new-value"
   ```
4. **Deploy and test**
5. **Revoke old key** (after confirming new one works)

---

## Contacts & Resources

- **Supabase Dashboard:** https://supabase.com/dashboard/project/itolyllbvbdorqapuhyj
- **Netlify Dashboard:** https://app.netlify.com/projects/trsrevos
- **GitHub Repo:** https://github.com/jayburgessjr/trsrevos
- **Production Site:** https://app.therevenuescientists.com

---

**Last Audit:** October 23, 2025
**Next Audit:** When adding new services or rotating keys
**Status:** ✅ All environments synchronized
