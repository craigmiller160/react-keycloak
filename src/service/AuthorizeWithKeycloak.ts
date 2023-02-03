import { KeycloakAuthConfig } from './KeycloakAuthConfig';
import Keycloak from 'keycloak-js';
import { KeycloakAuth } from '../KeycloakAuth';
import { UnauthorizedError } from '../errors/UnauthorizedError';
import { AccessDeniedError } from '../errors/AccessDeniedError';

type AuthState = 'authorizing' | 'role-check' | 'authorized';

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
		return Promise.reject(new UnauthorizedError());
	});

const handleRoleCheck = (context: AuthContext): Promise<AuthContext> => {
	const missingRequiredRealmRoles = (
		context.config.requiredRoles?.realm ?? []
	).filter(
		(role) =>
			!context.keycloak.tokenParsed?.realm_access?.roles.includes(role)
	);
	const missingRequiredClientRoles = Object.entries(
		context.config.requiredRoles?.client ?? {}
	).flatMap(([clientId, roles]) => {
		roles.filter(
			(role) =>
				!context.keycloak.tokenParsed?.resource_access?.[
					clientId
				].roles.includes(role)
		);
	});

	if (
		missingRequiredRealmRoles.length > 0 ||
		missingRequiredClientRoles.length > 0
	) {
		return Promise.reject(new AccessDeniedError());
	}
	return Promise.resolve({
		...context,
		state: 'authorized'
	});
};

const handleAuthStep = (context: AuthContext): Promise<AuthContext> => {
	switch (context.state) {
		case 'authorizing':
			return handleAuthorizing(context).then(handleAuthStep);
		case 'role-check':
			return handleRoleCheck(context).then(handleAuthStep);
		case 'authorized':
		default:
			return Promise.resolve(context);
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
