import { KeycloakAuthError, KeycloakAuthErrorType } from './KeycloakAuthError';

export class ErrorDuringAuthorization
	extends Error
	implements KeycloakAuthError
{
	readonly name = 'ErrorDuringAuthorization';
	readonly type: KeycloakAuthErrorType = 'error-during-authorization';

	constructor(cause: Error) {
		super('An error occurred during authorization', {
			cause
		});
	}
}
