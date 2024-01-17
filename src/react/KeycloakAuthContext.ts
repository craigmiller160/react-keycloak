import { createContext } from 'react';
import { KeycloakAuth } from './types';

export const KeycloakAuthContext = createContext<KeycloakAuth>({
	status: 'pre-auth',

	logout: () => {},
	isPreAuthorization: true,
	isPostAuthorization: false
});
