import {
	NodeConnectionTypes,
	NodeOperationError,
	type IDataObject,
	type IExecuteFunctions,
	type INodeExecutionData,
	type INodeType,
	type INodeTypeDescription,
} from 'n8n-workflow';
import codexFile from './Treffer.node.json';
import { accountDescription } from './resources/account';
import { getCreditBalance } from './resources/account/getCreditBalance';
import { emailDescription } from './resources/email';
import { findEmail } from './resources/email/find';
import { runWithConcurrency } from './shared/concurrency';
import { MAX_PARALLEL_LOOKUPS } from './shared/constants';
import { toNodeError } from './shared/errors';

type Lookup = (this: IExecuteFunctions, itemIndex: number) => Promise<IDataObject>;

const LOOKUPS: Record<string, Record<string, Lookup>> = {
	email: { find: findEmail },
	account: { getCreditBalance },
};

export class Treffer implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Treffer German Email Finder',
		name: 'treffer',
		icon: {
			light: 'file:../../icons/treffer.light.svg',
			dark: 'file:../../icons/treffer.dark.svg',
		},
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Find verified work emails of people at German companies',
		defaults: {
			name: 'Treffer German Email Finder',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'trefferApi',
				required: true,
			},
		],
		// n8n reads the codex from the description for installed packages and from the codex
		// file for its custom nodes folder. Loading the file here keeps one source for both,
		// so the search aliases ("germany", "email finder", ...) work everywhere.
		codex: {
			categories: codexFile.categories,
			alias: codexFile.alias,
			resources: codexFile.resources,
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Email',
						value: 'email',
					},
					{
						name: 'Account',
						value: 'account',
					},
				],
				default: 'email',
			},
			...emailDescription,
			...accountDescription,
		],
	};

	// Programmatic instead of declarative: declarative nodes send the requests of all items
	// at once, which runs a large sheet straight into the rate limit. This runs a few
	// lookups in parallel and retries rate limited calls itself. n8n's own Retry On Fail
	// would rerun every item and charge found emails again.
	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;
		const lookup = LOOKUPS[resource]?.[operation];
		if (!lookup) {
			throw new NodeOperationError(
				this.getNode(),
				`The operation "${operation}" is not supported for "${resource}"`,
			);
		}

		const results = await runWithConcurrency(
			items.length,
			MAX_PARALLEL_LOOKUPS,
			async (itemIndex): Promise<INodeExecutionData> => {
				try {
					return { json: await lookup.call(this, itemIndex), pairedItem: { item: itemIndex } };
				} catch (error) {
					if (this.continueOnFail()) {
						return { json: { error: (error as Error).message }, pairedItem: { item: itemIndex } };
					}
					throw toNodeError(this.getNode(), error, itemIndex);
				}
			},
		);
		return [results];
	}
}
