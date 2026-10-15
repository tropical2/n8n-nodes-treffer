import type { INodeProperties } from 'n8n-workflow';

export const accountDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['account'],
			},
		},
		options: [
			{
				name: 'Get Credit Balance',
				value: 'getCreditBalance',
				action: 'Get the credit balance',
				description: 'Get the remaining credits of your Treffer account. Free.',
			},
		],
		default: 'getCreditBalance',
	},
];
