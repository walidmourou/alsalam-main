# 🚀 Quick Start - CPU Usage Fix

## What Was Fixed

Your Next.js app was experiencing high CPU usage because:

1. ❌ No caching - every page was rendered on every request
2. ❌ Inefficient database queries - loading all data then filtering in memory
3. ❌ No static generation - all pages were dynamic
4. ❌ Small database connection pool

All of these issues have been fixed! 🎉

## Immediate Actions Required

### 1. Test Locally First

```bash
# Install dependencies (if needed)
npm install

# Build the optimized version
npm run build

# Look for these symbols in the output:
# ○ Static  - Good! Page is pre-rendered
# ● SSG     - Great! Generated at build time
# λ Dynamic - Indicates server-side rendering (expected for some pages)
```

Expected output:

```
Route (app)                              Size     First Load JS
┌ ○ /[lang]                             123 kB         456 kB
├ ● /[lang]/articles                    789 B          234 kB
├ ● /[lang]/articles/[id]               890 B          345 kB
├ ○ /[lang]/prayers                     567 B          123 kB
├ ○ /[lang]/cookie-policy               234 B          456 kB
└ ○ /[lang]/privacy-policy              345 B          567 kB

○ (Static)   prerendered as static HTML
● (SSG)      generated as static HTML + JSON
λ (Dynamic)  server-rendered on demand
```

### 2. Test the App

```bash
# Start the production server
npm run start

# In another terminal, verify performance
npm run verify-performance

# Or manually test
curl -I http://localhost:3000/de
# Look for: x-nextjs-cache: HIT
```

### 3. Deploy to Production

```bash
# Commit changes
git add .
git commit -m "feat: optimize performance - fix high CPU usage"
git push origin main

# Deploy (adjust based on your hosting)
# Vercel: Automatic deployment on push
# Railway: Automatic deployment on push
# Other: Manual deployment process
```

## Expected Results

### Before Optimization

- 🔴 CPU: 80-100% constantly
- 🔴 Response Time: 500-2000ms
- 🔴 Database Queries: 100+ per minute
- 🔴 Every request hits database

### After Optimization

- 🟢 CPU: 10-30% average
- 🟢 Response Time: 50-200ms (cached), 200-500ms (first request)
- 🟢 Database Queries: 10-20 per minute (mainly cache refreshes)
- 🟢 Most requests served from cache

## Monitoring After Deployment

### Check #1: Response Times (Immediate)

Visit your site and check browser DevTools:

- Network tab should show fast response times (<200ms)
- Subsequent page loads should be even faster

### Check #2: CPU Usage (After 5 minutes)

Monitor your server:

```bash
# If using pm2
pm2 monit

# Or check system stats
top
htop
```

CPU should drop significantly within 5-10 minutes.

### Check #3: Cache Hit Rate (After 10 minutes)

Run the verification script:

```bash
npm run verify-performance
```

Should show cache hits on second run.

## If CPU Is Still High

### Troubleshooting Steps:

1. **Check Build Output**

   ```bash
   npm run build
   ```

   - Ensure pages show ○ or ● symbols
   - No excessive λ (lambda) symbols

2. **Verify Environment**
   - Check `NODE_ENV=production` is set
   - Ensure using `npm run start`, not `npm run dev`

3. **Check Database**
   - Run: `npm run verify-db-indexes` (if available)
   - Ensure indexes exist on articles table

   ```sql
   SHOW INDEX FROM articles;
   ```

4. **Monitor Database Connections**
   - Check active connections aren't maxed out
   - Consider increasing pool size if needed

5. **Enable Detailed Logging**
   Add to your `.env`:
   ```env
   NEXT_TELEMETRY_DISABLED=0
   DEBUG=*
   ```

## Revalidation Intervals

Pages automatically refresh at these intervals:

| Page           | Revalidation | Why                              |
| -------------- | ------------ | -------------------------------- |
| Home           | 5 minutes    | Recent articles may change       |
| Articles List  | 5 minutes    | New articles may be published    |
| Article Detail | 5 minutes    | Content may be updated           |
| Prayers        | 1 hour       | Prayer times change daily        |
| Policies       | Static       | Never change (until code update) |

### Adjust Revalidation (Optional)

If you want faster updates:

```typescript
// In page.tsx
export const revalidate = 60; // 1 minute instead of 5
```

If you want better caching:

```typescript
// In page.tsx
export const revalidate = 3600; // 1 hour instead of 5 minutes
```

## Database Optimization (Recommended)

Add these indexes to your MySQL database:

```sql
-- Run these in your database
CREATE INDEX idx_articles_status_published
  ON articles(status, published_at);

CREATE INDEX idx_articles_title_de
  ON articles(title_de(100));

CREATE INDEX idx_articles_title_fr
  ON articles(title_fr(100));

CREATE INDEX idx_articles_title_ar
  ON articles(title_ar(100));

-- Verify indexes were created
SHOW INDEX FROM articles;
```

## Emergency Rollback

If something breaks after deployment:

### Option 1: Increase Cache Time (Quick Fix)

In affected page.tsx files:

```typescript
export const revalidate = 10; // Very short cache
```

### Option 2: Disable ISR for Specific Page

```typescript
export const dynamic = "force-dynamic"; // Back to dynamic rendering
```

### Option 3: Full Rollback

```bash
git revert HEAD
git push origin main
```

## Next Steps

1. ✅ Deploy and monitor for 24 hours
2. ✅ Check CPU usage graphs
3. ✅ Verify response times improved
4. ✅ Add database indexes
5. ✅ Consider adding Redis cache (optional)
6. ✅ Set up monitoring alerts (optional)

## Need Help?

If CPU is still high after 24 hours:

1. Run `npm run verify-performance`
2. Check server logs for errors
3. Monitor database query times
4. Check for memory leaks: `node --inspect`

## Success Metrics

After 24 hours, you should see:

- ✅ CPU usage < 30%
- ✅ Response times < 200ms
- ✅ Cache hit rate > 60%
- ✅ Database connections stable
- ✅ No memory leaks

---

**Last Updated:** February 10, 2026
**Optimization Target:** Next.js 16.1.4 with MySQL
