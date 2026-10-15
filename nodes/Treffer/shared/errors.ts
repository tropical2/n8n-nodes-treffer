import { NodeApiError, NodeOperationError, type INode, type JsonObject } from 'n8n-workflow';

/** The error to show for a failed item. API answers and input checks already are node
 * errors; anything else is a connection failure or timeout that never got an answer. */
export function toNodeError(
	node: INode,
	error: unknown,
	itemIndex: number,
): NodeApiError | NodeOperationError {
	if (error instanceof NodeApiError || error instanceof NodeOperationError) {
		return error;
	}
	return new NodeApiError(node, error as JsonObject, { itemIndex });
}
