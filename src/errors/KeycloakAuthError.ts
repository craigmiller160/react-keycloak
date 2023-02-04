export type KeycloakAuthErrorType = 'unauthorized' | 'access-denied';

export interface KeycloakAuthError extends Error {
	readonly type: KeycloakAuthErrorType;
}
