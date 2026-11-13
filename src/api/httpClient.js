/**
 * Shared HTTP client wrapper with timeout, signal management, and normalized error handling.
 */

import { APP_CONFIG } from '../utils/constants';

/**
 * Creates a normalized error object with actionable message and context.
 */
export function createNormalizedError({
  message,
  status = 0,
  code = 'NETWORK_ERROR',
  suggestion = 'Please check your connection and try again.',
  isRateLimited = false,
  isTimeout = false,
}) {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  error.suggestion = suggestion;
  error.isRateLimited = isRateLimited;
  error.isTimeout = isTimeout;
  return error;
}

/**
 * Standard fetch with configurable timeout and abort controller combination.
 */
export async function httpClient(url, options = {}) {
  const {
    timeout = APP_CONFIG.REQUEST_TIMEOUT_MS,
    signal: externalSignal,
    headers = {},
    ...rest
  } = options;

  const controller = new AbortController();
  let timedOut = false;

  const timeoutId = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeout);

  // Link external signal if supplied
  if (externalSignal) {
    if (externalSignal.aborted) {
      clearTimeout(timeoutId);
      throw createNormalizedError({
        message: 'Request was aborted before execution.',
        code: 'ABORTED',
        suggestion: 'Please try searching again.',
      });
    }
    externalSignal.addEventListener('abort', () => controller.abort());
  }

  try {
    const response = await fetch(url, {
      ...rest,
      headers: {
        Accept: 'application/json',
        ...headers,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw createNormalizedError({
          status: response.status,
          code: 'UNAUTHORIZED',
          message: 'API key authorization failed.',
          suggestion: 'Check that your API keys are configured in your .env file.',
        });
      }
      if (response.status === 429) {
        throw createNormalizedError({
          status: response.status,
          code: 'RATE_LIMITED',
          isRateLimited: true,
          message: 'API rate limit exceeded.',
          suggestion: 'Please wait a few moments before trying again.',
        });
      }
      if (response.status === 404) {
        throw createNormalizedError({
          status: response.status,
          code: 'NOT_FOUND',
          message: 'Requested resource or city could not be found.',
          suggestion: 'Please check your spelling and search again.',
        });
      }
      throw createNormalizedError({
        status: response.status,
        code: `HTTP_${response.status}`,
        message: `Remote server responded with error code ${response.status}.`,
        suggestion: 'The weather service may be experiencing downtime. Please retry in a few moments.',
      });
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);

    if (error.code && error.suggestion) {
      throw error;
    }

    if (timedOut) {
      throw createNormalizedError({
        code: 'TIMEOUT',
        isTimeout: true,
        message: `Request timed out after ${timeout / 1000} seconds.`,
        suggestion: 'Your connection seems slow. Please check your network and retry.',
      });
    }

    if (error.name === 'AbortError') {
      throw createNormalizedError({
        code: 'ABORTED',
        message: 'Request was cancelled.',
        suggestion: '',
      });
    }

    throw createNormalizedError({
      code: 'NETWORK_FAILURE',
      message: 'Network request failed to reach the server.',
      suggestion: 'Please check your internet connection or any active firewall/ad-blocker.',
    });
  }
}
