import { createContext } from 'react';
import { KeycloakAuth } from './types';

export const KeycloakAuthContext = createContext<KeycloakAuth>({
	status: 'authorizing',
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	logout: () => {}
});
