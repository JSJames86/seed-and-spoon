/**
 * API Response and Error Handling Utilities
 */

import { nanoid } from 'nanoid';

/**
 * Generate a correlation ID for request tracking
 * @returns {string}
 */
export function generateCorrelationId() {
  return `req_${nanoid(16)}`;
}

/**
 * Structured logger with correlation ID support
 */
export class Logger {
  constructor(correlationId = null) {
    this.correlationId = correlationId || generateCorrelationId();
  }

  _formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      correlationId: this.correlationId,
      message,
      ...meta,
    };

    // Filter out sensitive data
    if (logEntry.error && logEntry.error.stack) {
      logEntry.errorStack = logEntry.error.stack;
      delete logEntry.error;
    }

    return logEntry;
  }

  info(message, meta = {}) {
    const logEntry = this._formatMessage('info', message, meta);
    console.log(JSON.stringify(logEntry));
  }

  warn(message, meta = {}) {
    const logEntry = this._formatMessage('warn', message, meta);
    console.warn(JSON.stringify(logEntry));
  }

  error(message, error = null, meta = {}) {
    const logEntry = this._formatMessage('error', message, {
      ...meta,
      error: error ? {
        message: error.message,
        name: error.name,
        code: error.code,
      } : null,
      errorStack: error?.stack,
    });
    console.error(JSON.stringify(logEntry));
  }

  debug(message, meta = {}) {
    if (process.env.LOG_LEVEL === 'debug' || process.env.NODE_ENV === 'development') {
      const logEntry = this._formatMessage('debug', message, meta);
      console.debug(JSON.stringify(logEntry));
    }
  }
}

/**
 * Standard API success response
 * @param {any} data - Response data
 * @param {number} status - HTTP status code
 * @returns {Response}
 */
export function successResponse(data, status = 200) {
  return Response.json(
    {
      ok: true,
      data,
    },
    { status }
  );
}

/**
 * Standard API error response
 * @param {string} message - Error message
 * @param {number} status - HTTP status code
 * @param {object} details - Additional error details
 * @returns {Response}
 */
export function errorResponse(message, status = 500, details = null) {
  const errorBody = {
    ok: false,
    error: message,
  };

  if (details && process.env.NODE_ENV === 'development') {
    errorBody.details = details;
  }

  return Response.json(errorBody, { status });
}

/**
 * Validation error response
 * @param {object} validationErrors - Zod validation errors
 * @returns {Response}
 */
export function validationErrorResponse(validationErrors) {
  return Response.json(
    {
      ok: false,
      error: 'Validation failed',
      details: validationErrors,
    },
    { status: 400 }
  );
}

/**
 * Handle async API route with error catching
 * @param {Function} handler - Async handler function
 * @returns {Function}
 */
export function withErrorHandling(handler) {
  return async (request, context) => {
    const logger = new Logger();

    try {
      logger.info('API Request', {
        method: request.method,
        url: request.url,
      });

      return await handler(request, context, logger);
    } catch (error) {
      logger.error('API Error', error, {
        method: request.method,
        url: request.url,
      });

      // Don't leak internal errors in production
      if (process.env.NODE_ENV === 'production') {
        return errorResponse('Internal server error', 500);
      }

      return errorResponse(error.message, 500, {
        stack: error.stack,
      });
    }
  };
}

/**
 * Parse request body with error handling
 * @param {Request} request
 * @returns {Promise<object>}
 */
export async function parseRequestBody(request) {
  try {
    const contentType = request.headers.get('content-type');

    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Content-Type must be application/json');
    }

    return await request.json();
  } catch (error) {
    throw new Error(`Failed to parse request body: ${error.message}`);
  }
}

/**
 * Rate limiting check (simple in-memory implementation)
 * For production, use Redis or similar
 */
const rateLimitStore = new Map();

export function checkRateLimit(identifier, maxRequests = 10, windowMs = 60000) {
  const now = Date.now();
  const key = identifier;

  if (!rateLimitStore.has(key)) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  const record = rateLimitStore.get(key);

  // Reset if window expired
  if (now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  // Increment count
  record.count++;

  if (record.count > maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: record.resetTime,
    };
  }

  return {
    allowed: true,
    remaining: maxRequests - record.count,
  };
}

/**
 * Get client IP address from request
 * @param {Request} request
 * @returns {string}
 */
export function getClientIp(request) {
  // Check Vercel-specific headers first
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  return 'unknown';
}

/**
 * Mask email for safe display
 * @param {string} email
 * @returns {string}
 */
export function maskEmail(email) {
  if (!email) return '';

  const [localPart, domain] = email.split('@');
  if (!domain) return email;

  const maskedLocal = localPart.length > 2
    ? localPart[0] + '*'.repeat(localPart.length - 2) + localPart[localPart.length - 1]
    : localPart[0] + '*';

  return `${maskedLocal}@${domain}`;
}

/**
 * Sanitize data for safe logging (remove sensitive fields)
 * @param {object} data
 * @returns {object}
 */
export function sanitizeForLogging(data) {
  const sensitiveFields = [
    'password',
    'token',
    'secret',
    'apiKey',
    'creditCard',
    'ssn',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
  ];

  const sanitized = { ...data };

  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = '[REDACTED]';
    }
  }

  return sanitized;
}
