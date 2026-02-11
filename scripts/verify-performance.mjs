#!/usr/bin/env node

/**
 * Performance Verification Script
 * Run this after deployment to verify optimizations are working
 */

const https = require('https');
const http = require('http');

// Configuration
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const LOCALES = ['de', 'fr', 'ar'];

// Test URLs
const TEST_URLS = [
  '/',
  '/articles',
  '/prayers',
  '/cookie-policy',
  '/privacy-policy',
];

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const startTime = Date.now();

    protocol.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        const duration = Date.now() - startTime;
        resolve({
          url,
          statusCode: res.statusCode,
          duration,
          cacheControl: res.headers['cache-control'],
          age: res.headers['age'],
          xNextjsCache: res.headers['x-nextjs-cache'],
        });
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function testUrl(locale, path) {
  const url = `${BASE_URL}/${locale}${path === '/' ? '' : path}`;
  
  try {
    const result = await makeRequest(url);
    
    const status = result.statusCode === 200 ? '✓' : '✗';
    const statusColor = result.statusCode === 200 ? 'green' : 'red';
    
    log(`${status} ${url}`, statusColor);
    log(`  Response Time: ${result.duration}ms`, result.duration < 200 ? 'green' : result.duration < 500 ? 'yellow' : 'red');
    
    if (result.xNextjsCache) {
      const cacheStatus = result.xNextjsCache.toUpperCase();
      const cacheColor = cacheStatus === 'HIT' ? 'green' : cacheStatus === 'STALE' ? 'yellow' : 'blue';
      log(`  Cache Status: ${cacheStatus}`, cacheColor);
    }
    
    if (result.cacheControl) {
      log(`  Cache-Control: ${result.cacheControl}`, 'blue');
    }
    
    if (result.age) {
      log(`  Age: ${result.age}s`, 'blue');
    }
    
    console.log('');
    
    return result;
  } catch (error) {
    log(`✗ ${url}`, 'red');
    log(`  Error: ${error.message}`, 'red');
    console.log('');
    return null;
  }
}

async function runTests() {
  log('='.repeat(60), 'blue');
  log('Performance Verification Test', 'blue');
  log('='.repeat(60), 'blue');
  log(`Testing: ${BASE_URL}`, 'blue');
  log('');

  const results = [];
  
  for (const locale of LOCALES) {
    log(`Testing Locale: ${locale.toUpperCase()}`, 'yellow');
    log('-'.repeat(60), 'yellow');
    
    for (const path of TEST_URLS) {
      const result = await testUrl(locale, path);
      if (result) {
        results.push(result);
      }
    }
  }

  // Summary
  log('='.repeat(60), 'blue');
  log('Summary', 'blue');
  log('='.repeat(60), 'blue');
  
  const avgResponseTime = results.reduce((sum, r) => sum + r.duration, 0) / results.length;
  const cacheHits = results.filter(r => r.xNextjsCache === 'HIT').length;
  const totalRequests = results.length;
  const cacheHitRate = ((cacheHits / totalRequests) * 100).toFixed(1);
  
  log(`Total Requests: ${totalRequests}`, 'blue');
  log(`Average Response Time: ${avgResponseTime.toFixed(0)}ms`, avgResponseTime < 200 ? 'green' : 'yellow');
  log(`Cache Hits: ${cacheHits}/${totalRequests} (${cacheHitRate}%)`, cacheHits > 0 ? 'green' : 'yellow');
  
  log('');
  log('Recommendations:', 'yellow');
  
  if (avgResponseTime > 500) {
    log('  ⚠ Average response time is high (>500ms)', 'yellow');
    log('    Consider: Reduce revalidation time or add more caching', 'yellow');
  } else if (avgResponseTime < 200) {
    log('  ✓ Excellent response times!', 'green');
  }
  
  if (cacheHits === 0) {
    log('  ⚠ No cache hits detected', 'yellow');
    log('    Note: First run won\'t have cache hits. Run again to test caching.', 'yellow');
  } else if (cacheHitRate < 50) {
    log('  ⚠ Low cache hit rate', 'yellow');
    log('    Consider: Increase revalidation time or check ISR configuration', 'yellow');
  } else {
    log('  ✓ Good cache hit rate!', 'green');
  }
  
  log('');
  log('Run this script twice to see cache improvements:', 'blue');
  log('  1st run: Populates the cache', 'blue');
  log('  2nd run: Should show cache hits', 'blue');
}

// Run tests
runTests().catch((error) => {
  log(`Fatal error: ${error.message}`, 'red');
  process.exit(1);
});
