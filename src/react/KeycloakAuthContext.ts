import { createContext } from 'react';
import type { KeycloakError, KeycloakTokenParsed } from 'keycloak-js';
import { Logout } from '../core/types';

export type KeycloakAuthStatus = 'pre-auth' | 'authorizing' | 'post-auth';

export type KeycloakAuth = {
	readonly status: KeycloakAuthStatus;
	readonly isAuthorized: boolean;
	readonly token?: string;
	readonly tokenParsed?: KeycloakTokenParsed;
	readonly error?: KeycloakError;
	readonly logout: Logout;
};

export const KeycloakAuthContext = createContext<KeycloakAuth>({
	status: 'pre-auth',
	isAuthorized: false,
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	logout: () => {}
});
