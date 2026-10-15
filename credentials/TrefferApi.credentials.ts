import type {
	IAuthenticateGeneric,
	Icon,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';
import { API_BASE_URL } from '../nodes/Treffer/shared/constants';

export class TrefferApi implements ICredentialType {
	name = 'trefferApi';

	displayName = 'Treffer API';

	icon: Icon = { light: 'file:../icons/treffer.light.svg', dark: 'file:../icons/treffer.dark.svg' };

	documentationUrl =
		'https://treffer.io/docs/authentication/?utm_source=n8n&utm_medium=integration';

	properties: INodeProperties[] = [
		{
			// A notice is always visible, a field description only shows on hover
			displayName:
				'Create a key in your <a href="https://treffer.io/app/api-keys/?utm_source=n8n&utm_medium=integration" target="_blank">Treffer dashboard</a>. No account yet? <a href="https://treffer.io/accounts/signup/?utm_source=n8n&utm_medium=integration" target="_blank">Start free</a>, no credit card needed.',
			name: 'signupNotice',
			type: 'notice',
			default: '',
		},
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			required: true,
			default: '',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'X-API-Key': '={{$credentials.apiKey}}',
			},
		},
	};

	// The credit balance is free, so checking a key costs nothing
	test: ICredentialTestRequest = {
		request: {
			baseURL: API_BASE_URL,
			url: '/account/credits',
		},
	};
}
