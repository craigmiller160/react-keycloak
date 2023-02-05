import { KeycloakError, KeycloakTokenParsed } from 'keycloak-js';
import { Logout } from '../core/types';

export type KeycloakAuthStatus = 'authorizing' | 'authorized' | 'unauthorized';

export type KeycloakAuth = {
	readonly status: KeycloakAuthStatus;
	readonly token?: string;
	readonly tokenParsed?: KeycloakTokenParsed;
	readonly error?: KeycloakError;
	readonly logout: Logout;
};
