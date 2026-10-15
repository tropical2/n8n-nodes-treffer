import {
	NodeApiError,
	sleep,
	type IDataObject,
	type IExecuteFunctions,
	type IHttpRequestMethods,
	type IN8nHttpFullResponse,
	type JsonObject,
} from 'n8n-workflow';
import {
	API_BASE_URL,
	DEFAULT_RETRY_WAIT_SECONDS,
	MAX_ATTEMPTS,
	MAX_RETRY_WAIT_SECONDS,
	REQUEST_TIMEOUT_MS,
} from './constants';

const RETRYABLE_STATUS_CODES = [429, 503];

function retryWaitMs(headers: IN8nHttpFullResponse['headers']): number {
	const seconds = Number(headers?.['retry-after']);
	const wait = Number.isFinite(seconds) && seconds > 0 ? seconds : DEFAULT_RETRY_WAIT_SECONDS;
	return Math.min(wait, MAX_RETRY_WAIT_SECONDS) * 1000;
}

/** Calls the Treffer API and returns the response body. Retries rate limited and
 * temporarily unavailable calls; any other error status becomes a NodeApiError that
 * carries the API's own message. */
export async function trefferApiRequest(
	this: IExecuteFunctions,
	method: IHttpRequestMethods,
	path: string,
	itemIndex: number,
	body?: IDataObject,
): Promise<IDataObject> {
	for (let attempt = 1; ; attempt++) {
		const response = (await this.helpers.httpRequestWithAuthentication.call(this, 'trefferApi', {
			method,
			url: `${API_BASE_URL}${path}`,
			body,
			json: true,
			timeout: REQUEST_TIMEOUT_MS,
			returnFullResponse: true,
			ignoreHttpStatusErrors: true,
			abortSignal: this.getExecutionCancelSignal(),
		})) as IN8nHttpFullResponse;
		const data = response.body as IDataObject;

		if (response.statusCode < 400) {
			return data;
		}
		if (RETRYABLE_STATUS_CODES.includes(response.statusCode) && attempt < MAX_ATTEMPTS) {
			await sleep(retryWaitMs(response.headers));
			continue;
		}
		throw new NodeApiError(this.getNode(), data as JsonObject, {
			itemIndex,
			httpCode: String(response.statusCode),
			message: typeof data?.message === 'string' ? data.message : undefined,
		});
	}
}
