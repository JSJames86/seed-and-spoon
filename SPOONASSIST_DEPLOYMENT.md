# SpoonAssist Subdomain Deployment Guide

## Current Issue
- **Expected**: https://spoonassist.seedandspoon.org → SpoonAssist page
- **Actual**: https://spoonassist.seedandspoon.org → Main seedandspoon.org homepage
- **Working**: https://seedandspoon.org/spoonassist → SpoonAssist page ✓

## Solution Overview

The SpoonAssist subdomain requires both Next.js configuration (done ✓) and Vercel domain setup.

### ✅ What's Already Configured

1. **Next.js Rewrites** (`next.config.js`)
   - Detects requests from `spoonassist.seedandspoon.org`
   - Automatically rewrites to `/spoonassist` path
   - Handles both root (`/`) and nested paths

2. **Code Integration**
   - SpoonAssist page at `app/spoonassist/page.jsx`
   - All components in `components/spoonassist/`
   - Assets in `public/spoonassist/`

## 🔧 Vercel Configuration Steps

### Step 1: Add Domain in Vercel Dashboard

1. Go to your Vercel project: **seed-and-spoon**
2. Navigate to **Settings** → **Domains**
3. Click **Add Domain**
4. Enter: `spoonassist.seedandspoon.org`
5. Click **Add**

Vercel will show you DNS configuration requirements.

### Step 2: Verify DNS Configuration

In your **Cloudflare DNS** settings for `seedandspoon.org`:

1. Check for existing CNAME record:
   ```
   Type: CNAME
   Name: spoonassist
   Target: cname.vercel-dns.com
   Proxy: DNS only (gray cloud)
   ```

2. If it doesn't exist, create it:
   - Click **Add Record**
   - Type: `CNAME`
   - Name: `spoonassist`
   - Target: `cname.vercel-dns.com` (Vercel will provide the exact target)
   - Proxy Status: **DNS only** (important!)
   - TTL: Auto
   - Save

### Step 3: Wait for DNS Propagation

- DNS changes can take 5-60 minutes to propagate
- Vercel will automatically verify the domain once DNS is detected
- You'll see a green checkmark in Vercel when ready

### Step 4: Test the Configuration

After DNS propagates, test these URLs:

```bash
# Should show SpoonAssist page
curl -I https://spoonassist.seedandspoon.org

# Should show main homepage
curl -I https://seedandspoon.org

# Should show SpoonAssist page (alternative)
curl -I https://seedandspoon.org/spoonassist
```

## 🔍 Troubleshooting

### Issue: Subdomain still shows main page

**Possible causes:**
1. DNS hasn't propagated yet (wait 30-60 minutes)
2. Cloudflare proxy is enabled (disable it - DNS only)
3. Vercel hasn't verified the domain yet

**Fix:**
```bash
# Check DNS from command line
dig spoonassist.seedandspoon.org

# Should show CNAME pointing to Vercel
# Look for: spoonassist.seedandspoon.org. 300 IN CNAME cname.vercel-dns.com.
```

### Issue: SSL certificate error

**Fix:**
- Vercel automatically provisions SSL certificates
- Wait up to 24 hours for certificate issuance
- Ensure Cloudflare SSL mode is set to **Full** (not Flexible)

### Issue: 404 on subdomain

**Fix:**
- Ensure latest code is deployed
- Check Vercel deployment logs
- Verify `next.config.js` rewrites are active

## 🚀 Deployment Checklist

- [x] Next.js rewrites configured in `next.config.js`
- [x] Code committed and pushed to branch
- [ ] Domain added in Vercel dashboard
- [ ] DNS CNAME record created in Cloudflare
- [ ] Cloudflare proxy disabled (DNS only)
- [ ] Vercel domain verification completed
- [ ] SSL certificate issued (automatic)
- [ ] Test subdomain loads SpoonAssist page
- [ ] Test main domain still works
- [ ] Test `/spoonassist` path still works

## 📝 Expected Behavior After Setup

| URL | Expected Page |
|-----|--------------|
| `https://spoonassist.seedandspoon.org` | SpoonAssist |
| `https://spoonassist.seedandspoon.org/anything` | SpoonAssist (rewrites to /spoonassist) |
| `https://seedandspoon.org` | Main homepage |
| `https://seedandspoon.org/spoonassist` | SpoonAssist |

## 🔐 Cloudflare Settings

**DNS Record:**
```
spoonassist    CNAME    cname.vercel-dns.com    DNS only
```

**SSL/TLS Mode:** Full (not Flexible or Full Strict)

**Proxy Status:** DNS only (gray cloud icon) - **Important!**

## 📞 Support

If issues persist after following these steps:

1. Check Vercel deployment logs
2. Verify DNS with `dig` or `nslookup`
3. Clear browser cache and try incognito mode
4. Contact Vercel support with your domain configuration

## ✅ Success Indicators

You'll know it's working when:
- ✅ `spoonassist.seedandspoon.org` loads the SpoonAssist page
- ✅ URL stays as `spoonassist.seedandspoon.org` (doesn't redirect)
- ✅ Green lock icon shows valid SSL certificate
- ✅ No console errors in browser
- ✅ Logo and assets load correctly

---

**Last Updated:** 2025-11-22
**Status:** DNS configuration required in Vercel + Cloudflare
