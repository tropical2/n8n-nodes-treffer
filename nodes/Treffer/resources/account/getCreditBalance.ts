import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { trefferApiRequest } from '../../shared/transport';

export async function getCreditBalance(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<IDataObject> {
	return await trefferApiRequest.call(this, 'GET', '/account/credits', itemIndex);
}
