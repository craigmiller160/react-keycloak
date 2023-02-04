import { KeycloakAuthError, KeycloakAuthErrorType } from './KeycloakAuthError';

export class UnauthorizedError extends Error implements KeycloakAuthError {
	readonly name = 'UnauthorizedError';
	readonly type: KeycloakAuthErrorType = 'access-denied';
	constructor() {
		super('User is unauthorized');
	}
}
