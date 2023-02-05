import { createContext } from 'react';
import type { KeycloakError, KeycloakTokenParsed } from 'keycloak-js';
import { Logout } from '../core/types';

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
};

export const KeycloakAuthContext = createContext<KeycloakAuth>({
	status: 'pre-auth',
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	logout: () => {}
});
