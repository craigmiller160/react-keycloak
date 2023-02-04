import { KeycloakAuthError, KeycloakAuthErrorType } from './KeycloakAuthError';

export class AccessDeniedError extends Error implements KeycloakAuthError {
	readonly name = 'AccessDeniedError';
	readonly type: KeycloakAuthErrorType = 'access-denied';

	constructor() {
		super('User does not have access to application');
	}
}
