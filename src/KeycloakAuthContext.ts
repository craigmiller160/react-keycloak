import { createContext } from 'react';

type CheckStatus = 'pre-check' | 'checking' | 'post-check';

export type KeycloakAuth = {
	readonly isAuthorized: boolean;
	readonly checkStatus: CheckStatus;
	readonly logout: () => void;
};

export const KeycloakAuthContext = createContext<KeycloakAuth>({
	isAuthorized: false,
	checkStatus: 'pre-check',
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	logout: () => {}
});
