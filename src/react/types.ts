import { KeycloakError, KeycloakTokenParsed } from 'keycloak-js';
import { Logout } from '@craigmiller160/keycloak-js';

export type KeycloakAuthStatus =
	| 'pre-auth'
	| 'authorizing'
	| 'authorized'
	| 'unauthorized';

export type KeycloakAuth = {
	readonly status: KeycloakAuthStatus;
	readonly token?: string;
	readonly tokenParsed?: KeycloakTokenParsed;
	readonly error?: KeycloakError;
	readonly logout: Logout;
	readonly isPreAuthorization: boolean;
	readonly isPostAuthorization: boolean;
};
