export const API_BASE_URL = 'https://api.treffer.io/v1';

// The API finishes every lookup within 90 seconds and asks clients to wait 100,
// the extra 10 seconds cover network transit.
export const REQUEST_TIMEOUT_MS = 100_000;

// Lookups in flight at once per node run. Sending every item at once would run a large
// sheet straight into the rate limit, one at a time would make it crawl.
export const MAX_PARALLEL_LOOKUPS = 5;

// Rate limited (429) and temporarily unavailable (503) calls are retried, waiting as long
// as the API's Retry-After header says, within these bounds.
export const MAX_ATTEMPTS = 5;
export const DEFAULT_RETRY_WAIT_SECONDS = 10;
export const MAX_RETRY_WAIT_SECONDS = 60;
