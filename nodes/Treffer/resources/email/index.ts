import type { INodeProperties } from 'n8n-workflow';
import { emailFindDescription } from './find';

const showOnlyForEmail = {
	resource: ['email'],
};

export const emailDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForEmail,
		},
		options: [
			{
				name: 'Find',
				value: 'find',
				action: 'Find a work email',
				description:
					'Find the verified work email of a person at a company. Only found emails cost credits.',
			},
		],
		default: 'find',
	},
	...emailFindDescription,
];
