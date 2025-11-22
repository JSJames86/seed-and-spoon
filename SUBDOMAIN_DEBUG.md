# SpoonAssist Subdomain Debugging Guide

## Current Status
✅ Code is merged to main
✅ `next.config.js` has correct rewrites
✅ `middleware.js` exists and is correct
✅ `/app/spoonassist/page.jsx` exists
❌ Subdomain still showing main site

This means: **Vercel configuration issue**

## Step 1: Check Vercel Domain Configuration

1. Go to https://vercel.com/dashboard
2. Select your **seed-and-spoon** project
3. Go to **Settings** → **Domains**

**Check these things:**

### A. Is the subdomain listed?
- Look for `spoonassist.seedandspoon.org` in the domains list
- If NOT listed: Click "Add" and add it

### B. What environment is it assigned to?
The subdomain MUST be assigned to **Production** (not Preview)

| Domain | Git Branch | Status |
|--------|-----------|--------|
| spoonassist.seedandspoon.org | ??? | ??? |

**Common Issue:** If it shows "All Branches" or a specific branch, change it to **Production**

**How to fix:**
- Click the domain
- Under "Git Branch" → Select **Production**
- Save

### C. Are there any redirects?
- On the domain row, check if there's a "Redirect" icon
- If yes, click it and **remove the redirect**
- The subdomain should NOT redirect to anything

## Step 2: Check Latest Deployment

1. Go to **Deployments** tab
2. Look at the most recent **Production** deployment
3. Click on it → Check the **time** (should be recent)

**If deployment is old (before your PR merge):**
- Go to main deployment
- Click the **⋯** (three dots)
- Select **Redeploy**
- Wait 1-2 minutes

## Step 3: Check Deployment Logs

1. In the latest deployment, click **View Function Logs**
2. Try visiting `spoonassist.seedandspoon.org` in another tab
3. Watch the logs in real-time

**What to look for:**
- 404 errors → Page not found (wrong path)
- Redirect logs → Vercel is redirecting somewhere
- Rewrite logs → Should see middleware executing

## Step 4: Force Cache Clear

Even if everything is right, Vercel's edge cache might be stale:

```bash
# In your terminal
curl -I https://spoonassist.seedandspoon.org
```

Look at the response headers:
- `x-vercel-cache: HIT` → Cached (stale)
- `x-vercel-cache: MISS` → Fresh from server

**To force clear:**
1. In Vercel project → **Settings** → **Advanced**
2. Find "Purge Cache"
3. Click **Purge Cache**
4. Wait 30 seconds
5. Try subdomain again in incognito

## Step 5: DNS Verification

```bash
# Check DNS is pointing to Vercel
nslookup spoonassist.seedandspoon.org
```

Should show Vercel's servers (e.g., `76.76.21.21` or `cname.vercel-dns.com`)

**If it shows your old server IP:**
- DNS hasn't propagated yet (wait 5-60 minutes)
- Or DNS is wrong in your domain registrar

## Most Likely Issue

Based on similar cases, it's usually **one of these**:

1. **Domain assigned to wrong environment** (Preview instead of Production)
2. **Old deployment still active** (needs redeploy)
3. **Redirect rule overriding rewrites** (remove redirect)
4. **Edge cache is stale** (purge cache)

## Quick Fix Command

If you have Vercel CLI:

```bash
vercel domains ls
vercel domains inspect spoonassist.seedandspoon.org
```

This shows exactly how it's configured.

## Expected Result

After fixing, you should see:

```bash
curl -I https://spoonassist.seedandspoon.org

HTTP/2 200
content-type: text/html
x-vercel-id: ...
# Page loads successfully
```

And visiting in browser shows SpoonAssist with URL staying as `spoonassist.seedandspoon.org`.

---

**Please check these and let me know what you find!** The most common culprit is the domain being on "All Branches" instead of "Production".
