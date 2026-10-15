import {
	NodeOperationError,
	type IDataObject,
	type IExecuteFunctions,
	type INodeProperties,
} from 'n8n-workflow';
import { trefferApiRequest } from '../../shared/transport';

const showOnlyForEmailFind = {
	resource: ['email'],
	operation: ['find'],
};

export const emailFindDescription: INodeProperties[] = [
	{
		displayName: 'Name Format',
		name: 'nameFormat',
		type: 'options',
		noDataExpression: true,
		options: [
			{
				name: 'First and Last Name',
				value: 'firstAndLastName',
			},
			{
				name: 'Full Name',
				value: 'fullName',
			},
		],
		default: 'firstAndLastName',
		displayOptions: {
			show: showOnlyForEmailFind,
		},
		description: 'How the name of the person arrives in your data',
	},
	{
		displayName: 'First Name',
		name: 'firstName',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'Max',
		displayOptions: {
			show: { ...showOnlyForEmailFind, nameFormat: ['firstAndLastName'] },
		},
	},
	{
		displayName: 'Last Name',
		name: 'lastName',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'Mustermann',
		displayOptions: {
			show: { ...showOnlyForEmailFind, nameFormat: ['firstAndLastName'] },
		},
	},
	{
		displayName: 'Full Name',
		name: 'fullName',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'Max Mustermann',
		displayOptions: {
			show: { ...showOnlyForEmailFind, nameFormat: ['fullName'] },
		},
	},
	{
		displayName: 'Company Domain',
		name: 'domain',
		type: 'string',
		default: '',
		placeholder: 'example.com',
		displayOptions: {
			show: showOnlyForEmailFind,
		},
		description:
			'Website domain of the company. Gives the most reliable match. Fill this, the company name, or both.',
	},
	{
		displayName: 'Company Name',
		name: 'companyName',
		type: 'string',
		default: '',
		placeholder: 'Muster Maschinenbau GmbH',
		displayOptions: {
			show: showOnlyForEmailFind,
		},
		description: 'Name of the company. Needed when you have no domain.',
	},
];

function textParameter(context: IExecuteFunctions, name: string, itemIndex: number): string {
	return String(context.getNodeParameter(name, itemIndex, '') ?? '').trim();
}

/** The request body for one item. Empty values are left out instead of sent as empty
 * strings, which the API rejects, so a sheet row with only a domain or only a company
 * name still works. */
function findRequestBody(context: IExecuteFunctions, itemIndex: number): IDataObject {
	const nameFormat = context.getNodeParameter('nameFormat', itemIndex) as string;

	const person =
		nameFormat === 'fullName'
			? { full_name: textParameter(context, 'fullName', itemIndex) }
			: {
					first_name: textParameter(context, 'firstName', itemIndex),
					last_name: textParameter(context, 'lastName', itemIndex),
				};
	if (Object.values(person).some((value) => !value)) {
		throw new NodeOperationError(
			context.getNode(),
			nameFormat === 'fullName'
				? 'Full Name is empty for this item'
				: 'First Name and Last Name both need a value for this item',
			{
				itemIndex,
				description: 'Map the name from your input data, or skip items without a name.',
			},
		);
	}

	const domain = textParameter(context, 'domain', itemIndex);
	const companyName = textParameter(context, 'companyName', itemIndex);
	if (!domain && !companyName) {
		throw new NodeOperationError(
			context.getNode(),
			'Company Domain and Company Name are both empty for this item',
			{
				itemIndex,
				description: 'Fill at least one of them. The domain gives the most reliable match.',
			},
		);
	}

	return {
		...person,
		...(domain && { domain }),
		...(companyName && { company_name: companyName }),
	};
}

export async function findEmail(this: IExecuteFunctions, itemIndex: number): Promise<IDataObject> {
	return await trefferApiRequest.call(
		this,
		'POST',
		'/email/finder',
		itemIndex,
		findRequestBody(this, itemIndex),
	);
}
