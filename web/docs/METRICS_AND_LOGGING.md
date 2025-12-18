# Metrics and Logging in the Web Application

This document explains how to use the Prometheus metrics and Winston logging systems in the AlphaGameBot web application.

## Overview

The web application now includes:

1. **Winston Logging**: Structured logging with different log levels
2. **Prometheus Metrics**: Performance and operational metrics exposed at `/metrics`
3. **Automatic Metric Collection**: Middleware for tracking HTTP requests

## Using the Logger

### Import and Create a Logger

```typescript
import { getLogger } from '@/app/lib/logging/logger';

const logger = getLogger('api/my-route');
```

### Log Levels

```typescript
logger.error('Critical error occurred', error);
logger.warn('Warning message');
logger.info('Information message');
logger.verbose('Verbose details');
logger.debug('Debug information');
```

### Best Practices

- Use descriptive logger names following the pattern: `api/route-name` or `component/name`
- Always use the logger instead of `console.log`
- Include relevant context in log messages

## Using Metrics

### Submitting Metrics

```typescript
import { metricsManager, Metrics } from '@/app/lib/metrics/metrics';

// Submit an API request metric
metricsManager.submitMetric<Metrics.API_REQUEST>(Metrics.API_REQUEST, {
    endpoint: '/api/users',
    method: 'GET',
    statusCode: 200,
    durationMs: 42.5
});

// Submit a database operation metric
metricsManager.submitMetric<Metrics.DATABASE_OPERATION>(Metrics.DATABASE_OPERATION, {
    model: 'User',
    operation: 'findMany',
    durationMs: 15.2
});
```

### Available Metrics

- `HTTP_REQUEST`: Track HTTP requests (method, path, status, duration)
- `API_REQUEST`: Track API endpoint requests
- `DATABASE_OPERATION`: Track database query performance
- `APPLICATION_ERROR`: Track application errors
- `METRICS_GENERATION_TIME`: Time to generate metrics
- `METRICS_QUEUE_LENGTH`: Number of metrics in queue

### Using the Metrics Wrapper

For API routes, use the `withMetricsAndLogging` wrapper to automatically track requests:

```typescript
import { withMetricsAndLogging } from '@/app/lib/middleware/withMetricsAndLogging';
import { NextRequest, NextResponse } from 'next/server';

async function handler(req: NextRequest) {
    // Your API logic here
    return NextResponse.json({ status: 'ok' });
}

export const GET = withMetricsAndLogging(handler, 'my-endpoint');
export const runtime = 'nodejs'; // Important: Specify Node.js runtime for logging/metrics
```

This wrapper automatically:
- Logs the request
- Tracks request duration
- Submits metrics
- Handles errors

## Accessing Metrics

Prometheus metrics are available at:

```
GET /api/metrics
```

This endpoint returns metrics in Prometheus format, including:
- Default Node.js metrics (heap size, GC stats, etc.)
- Custom application metrics (HTTP requests, database operations, etc.)

## Adding New Metrics

See the full guide in the bot's documentation: `../bot/docs/ADDING_METRICS.md`

The process is the same for the web app:

1. Add to `Metrics` enum in `app/lib/metrics/metrics.ts`
2. Add data shape to `app/lib/interfaces/metrics/MetricDataMap.ts`
3. Add configuration to `app/lib/metrics/definitions/metricConfigurations.ts`

## Edge Runtime Compatibility

**Important**: The logging and metrics systems require Node.js APIs and cannot be used in Next.js Edge Runtime.

For API routes that need logging/metrics:
- Add `export const runtime = 'nodejs';` to force Node.js runtime
- Use the `withMetricsAndLogging` wrapper

For middleware (which runs in Edge Runtime):
- Basic console logging is used instead
- Full metrics tracking should be done in API routes

## Database Logging

The Prisma client is configured to forward warn and error logs to Winston:

```typescript
client.$on('warn', (e) => {
    logger.warn(`Prisma: ${e.message}`);
});
```

This ensures all database warnings and errors are captured in the logging system.

## Example: Complete API Route with Logging and Metrics

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { withMetricsAndLogging } from '@/app/lib/middleware/withMetricsAndLogging';
import { getLogger } from '@/app/lib/logging/logger';
import client from '@/app/lib/database';

const logger = getLogger('api/users');

export const runtime = 'nodejs';

async function handler(req: NextRequest) {
    logger.debug('Fetching users from database');
    
    try {
        const users = await client.user.findMany({
            take: 10
        });
        
        logger.info(`Retrieved ${users.length} users`);
        
        return NextResponse.json({ users });
    } catch (error) {
        logger.error('Failed to fetch users:', error);
        return NextResponse.json(
            { error: 'Failed to fetch users' },
            { status: 500 }
        );
    }
}

export const GET = withMetricsAndLogging(handler, 'users');
```

## Monitoring and Alerting

The `/api/metrics` endpoint can be scraped by Prometheus for monitoring and alerting. Configure your Prometheus instance to scrape:

```yaml
scrape_configs:
  - job_name: 'alphagamebot-web'
    static_configs:
      - targets: ['web:3000']
    metrics_path: '/api/metrics'
```
