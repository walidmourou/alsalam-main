# Performance Optimization - CPU Usage Fix

## Issues Identified and Fixed

### 1. **No Static Regeneration (ISR)**

**Problem:** All pages were being rendered on every request without caching.

**Solution:** Added `revalidate` export to key pages:

- Home page: 5 minutes (300 seconds)
- Articles list page: 5 minutes (300 seconds)
- Prayer times page: 1 hour (3600 seconds)

```typescript
export const revalidate = 300; // Revalidate every 5 minutes
```

### 2. **Force Dynamic Rendering**

**Problem:** Articles page had `export const dynamic = "force-dynamic"` which prevented any static optimization.

**Solution:** Removed the force-dynamic export and added proper revalidation instead.

### 3. **Inefficient Database Queries**

**Problem:**

- Articles page loaded ALL articles then filtered/sorted in memory
- This caused high CPU usage processing data on every request

**Solution:** Moved filtering and sorting to SQL queries:

```typescript
// Before: Load all, then filter in memory
const articles = await getAllArticles();
const filtered = articles.filter(...);

// After: Filter in database
const articles = await getAllArticles(lang, searchQuery, sortBy);
```

### 4. **No Static Generation for Article Pages**

**Problem:** Article detail pages were rendered on-demand for each request.

**Solution:** Added `generateStaticParams()` to pre-build all article pages:

```typescript
export async function generateStaticParams() {
  const articleIds = await getAllArticleIds();
  return articleIds.map((id) => ({ id: id.toString() }));
}
```

### 5. **Database Connection Pool Too Small**

**Problem:** Connection limit of 10 was insufficient for production traffic.

**Solution:**

- Increased connection limit from 10 to 20
- Added connection timeout configuration
- Added charset configuration for better multilingual support

## Expected Performance Improvements

- **CPU Usage:** Should drop by 60-80% as pages are now cached
- **Response Time:** Should improve by 50-70% for cached pages
- **Database Load:** Reduced significantly due to:
  - Fewer queries (cached pages)
  - Optimized SQL queries
  - Better connection pooling

## Monitoring Recommendations

### 1. Check Build Output

After running `npm run build`, verify static generation:

```bash
npm run build
```

Look for output like:

```
○ (Static)   prerendered as static content
● (SSG)      automatically generated as static HTML + JSON
λ (Dynamic)  server-rendered on demand
```

### 2. Monitor in Production

Add these environment variables for monitoring:

```env
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=0  # Enable telemetry for monitoring
```

### 3. Key Metrics to Track

- **Response Time:** Should be < 100ms for cached pages
- **CPU Usage:** Should stay < 30% under normal load
- **Memory Usage:** Should be stable (no leaks)
- **Database Connections:** Monitor active connection count

## Additional Optimizations to Consider

### 1. Add Redis Caching (Optional)

For even better performance, consider adding Redis:

```bash
npm install ioredis
```

### 2. Enable Compression

Add compression in production:

```typescript
// next.config.ts
compress: true, // Enable gzip compression
```

### 3. Database Indexing

Ensure these indexes exist:

```sql
CREATE INDEX idx_articles_status_published ON articles(status, published_at);
CREATE INDEX idx_articles_title_de ON articles(title_de);
CREATE INDEX idx_articles_title_fr ON articles(title_fr);
CREATE INDEX idx_articles_title_ar ON articles(title_ar);
```

### 4. CDN Configuration

If not already using a CDN, consider:

- Cloudflare
- AWS CloudFront
- Vercel Edge Network

### 5. Database Query Optimization

Add connection pooling monitoring:

```typescript
pool.on("acquire", (connection) => {
  console.log("Connection %d acquired", connection.threadId);
});

pool.on("release", (connection) => {
  console.log("Connection %d released", connection.threadId);
});
```

## Deployment Checklist

- [ ] Run `npm run build` locally to verify build succeeds
- [ ] Check that generateStaticParams is working (see build output)
- [ ] Verify database indexes are in place
- [ ] Test revalidation by waiting 5 minutes and refreshing
- [ ] Monitor CPU usage after deployment
- [ ] Check database connection pool usage
- [ ] Verify response times are improved

## Rollback Plan

If issues occur after deployment:

1. **Quick Fix:** Increase revalidation time:

```typescript
export const revalidate = 60; // 1 minute instead of 5 minutes
```

2. **Emergency:** Temporarily go back to dynamic:

```typescript
export const dynamic = "force-dynamic";
```

3. **Database Issues:** Reduce connection pool:

```typescript
connectionLimit: 10,
```

## Files Modified

1. `src/app/[lang]/page.tsx` - Added revalidation
2. `src/app/[lang]/articles/page.tsx` - Optimized queries, added revalidation
3. `src/app/[lang]/articles/[id]/page.tsx` - Added static generation
4. `src/app/[lang]/prayers/page.tsx` - Added revalidation
5. `src/lib/db.ts` - Optimized connection pooling
6. `next.config.ts` - Added performance optimizations

## Support

For performance monitoring tools:

- [Next.js Analytics](https://nextjs.org/analytics)
- [Vercel Speed Insights](https://vercel.com/docs/speed-insights)
- [New Relic APM](https://newrelic.com/)
- [DataDog APM](https://www.datadoghq.com/)
