/** Runs `worker` for every index from 0 to count - 1 with at most `limit` calls in flight
 * and returns the results in index order. After the first failure no new call starts, and
 * the failure is rethrown once the running calls have settled. */
export async function runWithConcurrency<T>(
	count: number,
	limit: number,
	worker: (index: number) => Promise<T>,
): Promise<T[]> {
	const results: T[] = new Array(count);
	let nextIndex = 0;
	let failed = false;
	let failure: unknown;

	const runner = async () => {
		while (!failed && nextIndex < count) {
			const index = nextIndex++;
			try {
				results[index] = await worker(index);
			} catch (error) {
				// calls already in flight may fail too, the first failure is the one to report
				if (!failed) {
					failed = true;
					failure = error;
				}
			}
		}
	};

	await Promise.all(Array.from({ length: Math.min(limit, count) }, runner));
	if (failed) {
		throw failure;
	}
	return results;
}
