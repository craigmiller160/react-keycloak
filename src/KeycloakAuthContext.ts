import { createContext } from 'react';

type AuthStatus = 'pre-auth' | 'authorizing' | 'post-auth';

export type KeycloakAuth = {
	readonly isAuthorized: boolean;
	readonly authStatus: AuthStatus;
	readonly logout: () => void;
};

export const KeycloakAuthContext = createContext<KeycloakAuth>({
	isAuthorized: false,
	authStatus: 'pre-auth',
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	logout: () => {}
});
