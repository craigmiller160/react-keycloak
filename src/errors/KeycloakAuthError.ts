export type KeycloakAuthErrorType =
	| 'unauthorized'
	| 'access-denied'
	| 'authorization-stopped';

export interface KeycloakAuthError extends Error {
	readonly type: KeycloakAuthErrorType;
}
