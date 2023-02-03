import { KeycloakAuthConfig } from './KeycloakAuthConfig';
import Keycloak from 'keycloak-js';
import { KeycloakAuth } from '../KeycloakAuth';

type AuthState = 'pre-auth' | 'authorizing' | 'role-check' | 'post-auth';

type AuthContext = {
	readonly state: AuthState;
	readonly config: KeycloakAuthConfig;
	readonly keycloak: Keycloak;
};

const handleAuthStep = (context: AuthContext): Promise<unknown> => {};

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
