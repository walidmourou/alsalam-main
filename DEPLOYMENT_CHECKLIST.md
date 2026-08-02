# 🚀 DEPLOYMENT CHECKLIST

## Phase 1: Pre-Deployment (5 minutes)

### ✅ Step 1: Verify Changes Locally

```bash
# 1. Build the project
npm run build

# 2. Look for these symbols in output:
#    ○ Static  - Good!
#    ● SSG     - Great!
#    λ Dynamic - Normal for some pages

# 3. Expected output should include:
#    ○ /[lang]
#    ● /[lang]/articles/[id]
#    ○ /[lang]/prayers
#    ○ /[lang]/cookie-policy
#    ○ /[lang]/privacy-policy
```

**Expected Result:** Build succeeds with no errors ✅

---

### ✅ Step 2: Test Production Locally

```bash
# 1. Start production server
npm run start

# 2. Open browser to http://localhost:3000

# 3. Test these pages:
#    - Home page (any language)
#    - Articles list
#    - An article detail page
#    - Prayer times
```

**Expected Result:** All pages load quickly (<500ms) ✅

---

### ✅ Step 3: Run Performance Verification

```bash
npm run verify-performance

# First run: Will populate cache (no cache hits expected)
# Wait 10 seconds
# Second run: Should show cache hits
npm run verify-performance
```

**Expected Result:**

- First run: Average response time <500ms
- Second run: Cache hits shown, response time <200ms ✅

---

## Phase 2: Deployment (10 minutes)

### ✅ Step 4: Commit Changes

```bash
# Review changes
git status

# Stage all changes
git add .

# Commit with descriptive message
git commit -m "feat: optimize performance - fix high CPU usage

- Add ISR to home, articles, and prayer pages (5min-1hr revalidation)
- Optimize database queries (move filtering/sorting to SQL)
- Add static generation for article detail pages
- Increase DB connection pool from 10 to 20
- Add performance monitoring script
- Expected CPU reduction: 70-80%"

# Push to remote
git push origin main
```

**Expected Result:** Changes pushed successfully ✅

---

### ✅ Step 5: Monitor Deployment

```bash
# Watch deployment logs
# (Command depends on your hosting provider)

# Vercel:
vercel --prod

# Railway:
railway logs

# Other: Check your hosting dashboard
```

**Expected Result:** Deployment succeeds ✅

---

### ✅ Step 6: Wait for Cache Warmup (5 minutes)

```
⏱️ Wait 5-10 minutes after deployment
   This allows the cache to populate with first requests

   During this time:
   - CPU may still be elevated
   - Response times may be slower
   - This is NORMAL and expected
```

---

## Phase 3: Verification (30 minutes)

### ✅ Step 7: Test Production Site

```bash
# Replace with your production URL
export NEXT_PUBLIC_SITE_URL=https://your-site.com
npm run verify-performance

# Or test manually
curl -I https://your-site.com/de | grep -i cache
# Look for: x-nextjs-cache: HIT (after 2nd request)
```

**Expected Result:**

- Response times: <200ms (cached), <500ms (uncached)
- Cache headers present
- Second request shows cache hit ✅

---

### ✅ Step 8: Check CPU Usage

**Option 1: Hosting Dashboard**

1. Open your hosting provider dashboard
2. Navigate to metrics/monitoring
3. Check CPU usage graph

**Option 2: Server Command** (if you have SSH access)

```bash
# Login to server
ssh your-server

# Check CPU
top
# Press 'q' to quit

# Or
htop
```

**Expected Result:**

- CPU usage drops to <30% within 30 minutes ✅
- CPU should stabilize at 10-30% under normal load

---

### ✅ Step 9: Monitor Response Times

**Browser DevTools:**

1. Open your site
2. Press F12 (DevTools)
3. Go to Network tab
4. Refresh page
5. Check document load time

**Expected Result:**

- First load: 200-500ms
- Second load: 50-200ms ✅

---

### ✅ Step 10: Verify Database Load

**Check Active Connections:**

```sql
-- Connect to your database
-- Run this query:
SHOW PROCESSLIST;

-- Count active connections
SELECT COUNT(*) FROM information_schema.PROCESSLIST
WHERE DB = 'your_database_name';
```

**Expected Result:**

- Active connections: <10 (was 15-20 before)
- No "too many connections" errors ✅

---

## Phase 4: Optimization (Optional - 15 minutes)

### ✅ Step 11: Add Database Indexes

```sql
-- Connect to your MySQL database
-- Run these commands:

-- Check existing indexes
SHOW INDEX FROM articles;

-- Add performance indexes
CREATE INDEX idx_articles_status_published
  ON articles(status, published_at);

CREATE INDEX idx_articles_title_de
  ON articles(title_de(100));

CREATE INDEX idx_articles_title_fr
  ON articles(title_fr(100));

CREATE INDEX idx_articles_title_ar
  ON articles(title_ar(100));

-- Verify
SHOW INDEX FROM articles;
```

**Expected Result:**

- Indexes created successfully
- Query times improve by 20-30% ✅

---

## 24-Hour Monitoring

### ✅ After 24 Hours: Review Metrics

#### CPU Usage

- [ ] Average CPU: <30%
- [ ] Peak CPU: <50%
- [ ] No sustained 100% spikes

#### Response Times

- [ ] Average: <200ms
- [ ] P95: <500ms
- [ ] P99: <1000ms

#### Cache Performance

- [ ] Cache hit rate: >60%
- [ ] Cache misses: <40%

#### Database

- [ ] Active connections: <10 average
- [ ] Query time: <50ms average
- [ ] No connection errors

---

## Troubleshooting Guide

### ❌ Issue: CPU Still High After 30 Minutes

**Diagnosis:**

```bash
# 1. Check if running in production mode
echo $NODE_ENV
# Should output: production

# 2. Check process
ps aux | grep node
# Should see: node .next/standalone/server.js
# Should NOT see: next dev
```

**Solutions:**

1. Ensure using `npm run start`, NOT `npm run dev`
2. Set `NODE_ENV=production` environment variable
3. Restart the server

---

### ❌ Issue: No Cache Hits

**Diagnosis:**

```bash
# Test cache headers
curl -I https://your-site.com/de | grep -i cache

# Should see:
# cache-control: s-maxage=300, stale-while-revalidate
# x-nextjs-cache: HIT (on 2nd request)
```

**Solutions:**

1. Wait 5 minutes after deployment
2. Verify build succeeded with ○ and ● symbols
3. Check Next.js version: should be 16.1.4+

---

### ❌ Issue: Database Connections Maxed Out

**Diagnosis:**

```sql
SHOW PROCESSLIST;
-- If you see 20+ connections all from your app
```

**Solutions:**

1. Verify connection pool settings in src/lib/db.ts
2. Check for connection leaks (unclosed connections)
3. Increase pool size temporarily:
   ```typescript
   connectionLimit: 30, // Increase if needed
   ```

---

### ❌ Issue: Pages Not Updating

**Diagnosis:**

```bash
# Check revalidation settings
grep -r "revalidate" src/app/
```

**Solutions:**

1. Revalidation is working as designed (5min-1hr)
2. To force update: Clear cache or wait for revalidation
3. To update immediately: redeploy
4. For emergency: reduce revalidate time to 60 seconds

---

## Success Criteria Summary

After completing this checklist, you should achieve:

| Metric              | Target | Excellent | Your Result |
| ------------------- | ------ | --------- | ----------- |
| CPU Usage           | <40%   | <30%      | [ ]         |
| Response Time (avg) | <300ms | <200ms    | [ ]         |
| Cache Hit Rate      | >60%   | >80%      | [ ]         |
| DB Connections      | <15    | <10       | [ ]         |
| Build Success       | ✅     | ✅        | [ ]         |
| Zero Errors         | ✅     | ✅        | [ ]         |

---

## Quick Commands Reference

```bash
# Build
npm run build

# Start production
npm run start

# Test performance
npm run verify-performance

# Check errors
npm run lint

# Database check (if you have this script)
npm run check-all-tables
```

---

## Need Help?

1. **Check documentation:**
   - [PERFORMANCE_FIX_SUMMARY.md](./PERFORMANCE_FIX_SUMMARY.md)
   - [QUICK_START_PERFORMANCE.md](./QUICK_START_PERFORMANCE.md)
   - [PERFORMANCE_OPTIMIZATION.md](./PERFORMANCE_OPTIMIZATION.md)

2. **Review architecture:**
   - [ARCHITECTURE_DIAGRAM.md](./ARCHITECTURE_DIAGRAM.md)

3. **Common issues:**
   - Still using `npm run dev` in production
   - `NODE_ENV` not set to `production`
   - Cache hasn't populated yet (wait 5-10 minutes)
   - Database indexes not created

---

**Last Updated:** February 10, 2026
**Target:** 70-80% CPU reduction
**Timeline:** Results visible within 30 minutes of deployment
