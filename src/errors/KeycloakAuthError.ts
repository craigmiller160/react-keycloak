export type KeycloakAuthErrorType =
	| 'unauthorized'
	| 'access-denied'
	| 'authorization-stopped'
	| 'error-during-authorization';

export interface KeycloakAuthError extends Error {
	readonly type: KeycloakAuthErrorType;
}
