/** Runs an async action up to `attempts` times, rethrowing the last error with context. */
export async function withRetry<T>(
  description: string,
  action: () => Promise<T>,
  attempts = 3,
  delayMs = 500,
): Promise<T> {
  let lastError: unknown;
  for (let i = 1; i <= attempts; i++) {
    try {
      return await action();
    } catch (err) {
      lastError = err;
      if (i < attempts) await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  const msg = lastError instanceof Error ? lastError.message : String(lastError);
  throw new Error(`"${description}" failed after ${attempts} attempts: ${msg}`);
}
