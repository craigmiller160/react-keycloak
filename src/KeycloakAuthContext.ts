import { createContext } from 'react';
import type { KeycloakTokenParsed } from 'keycloak-js';

export type KeycloakAuthStatus = 'pre-auth' | 'authorizing' | 'post-auth';

export type KeycloakAuth = {
	readonly isAuthorized: boolean;
	readonly authStatus: KeycloakAuthStatus;
	readonly logout: () => void;
	readonly token?: KeycloakTokenParsed;
};

export const KeycloakAuthContext = createContext<KeycloakAuth>({
	isAuthorized: false,
	authStatus: 'pre-auth',
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	logout: () => {}
});
