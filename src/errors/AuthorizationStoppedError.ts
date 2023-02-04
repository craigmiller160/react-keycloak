import { KeycloakAuthError, KeycloakAuthErrorType } from './KeycloakAuthError';

export class AuthorizationStoppedError
	extends Error
	implements KeycloakAuthError
{
	readonly name = 'AuthorizationStoppedError';
	readonly type: KeycloakAuthErrorType = 'authorization-stopped';

	constructor() {
		super(
			'Authorization has been stopped, valid token no longer available'
		);
	}
}
