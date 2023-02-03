import { KeycloakAuthConfig } from './KeycloakAuthConfig';
import Keycloak from 'keycloak-js';
import { KeycloakAuth, KeycloakAuthStatus } from '../KeycloakAuth';

type AuthState = 'authorizing' | 'role-check' | 'authorized' | 'unauthorized';

type AuthContext = {
	readonly state: AuthState;
	readonly config: KeycloakAuthConfig;
	readonly keycloak: Keycloak;
};

const handleAuthorizing = (context: AuthContext): Promise<AuthContext> =>
	context.keycloak.init({ onLoad: 'login-required' }).then((isSuccess) => {
		if (isSuccess) {
			return Promise.resolve({
				...context,
				state: 'role-check'
			});
		}
		return Promise.reject(new Error('Authorization'));
	});

const handleAuthStep = (context: AuthContext): Promise<AuthContext> => {
	switch (context.state) {
		case 'authorizing':
			return handleAuthorizing(context).then(handleAuthStep);
		case 'role-check':
			return Promise.resolve();
		case 'unauthorized':
			return Promise.resolve();
		case 'authorized':
			return Promise.resolve();
		default:
			return Promise.resolve();
	}
};

export const authorizeWithKeycloak = (
	config: KeycloakAuthConfig
): Promise<KeycloakAuth> => {
	const keycloak = new Keycloak({
		url: config.authServerUrl,
		realm: config.realm,
		clientId: config.clientId
	});
	return handleAuthStep({
		state: 'pre-auth',
		config,
		keycloak
	});
};
