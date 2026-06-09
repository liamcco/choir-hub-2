export function getApiErrorMessage<T>(error: T | null): string | null {
  if (!error) {
    return null;
  }

  if (typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string') {
    return error.message;
  }

  return 'An unknown error occurred.';
}

export function getAuthErrorMessage(error: unknown): string | null {
  if (!error) {
    return null;
  }

  if (typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string') {
    return error.message;
  }

  return 'An unknown error occurred during authentication.';
}
