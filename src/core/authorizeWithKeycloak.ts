import {
	AuthorizeWithKeycloak,
	KeycloakAuthFailedHandler,
	KeycloakAuthorization,
	KeycloakAuthSubscription,
	KeycloakAuthSuccessHandler
} from './types';
import Keycloak, { KeycloakTokenParsed } from 'keycloak-js';
import { KeycloakAuthConfig } from '../service/KeycloakAuthConfig';
import { UnauthorizedError } from '../errors/UnauthorizedError';
import { nanoid } from 'nanoid';
import { AuthorizationStoppedError } from '../errors/AuthorizationStoppedError';
import { InternalAuthorization } from './InternalAuthorization';

type AuthState = 'authorizing' | 'authorized';

type AuthContext = {
	readonly state: AuthState;
	readonly config: KeycloakAuthConfig;
	readonly authorization: InternalAuthorization;
};

const handleAuthorizing = (context: AuthContext): Promise<AuthContext> =>
	context.authorization.keycloak
		.init({ onLoad: 'login-required' })
		.then((isSuccess) => {
			if (isSuccess) {
				return Promise.resolve({
					...context,
					state: 'authorized'
				});
			}
			return Promise.reject(new UnauthorizedError());
		});

const handleAuthorized = (context: AuthContext): Promise<AuthContext> => {
	context.authorization.emitAuthorized();
	return Promise.resolve(context);
};

const handleAuthStep = (context: AuthContext): Promise<AuthContext> => {
	switch (context.state) {
		case 'authorizing':
			return handleAuthorizing(context).then(handleAuthStep);
		case 'authorized':
		default:
			return handleAuthorized(context);
	}
};

export const authorizeWithKeycloak: AuthorizeWithKeycloak = (config) => {
	const keycloak = new Keycloak({
		url: config.authServerUrl,
		realm: config.realm,
		clientId: config.clientId
	});
	const authorization = new InternalAuthorization(keycloak);
	const promise = handleAuthStep({
		config,
		authorization,
		state: 'authorizing'
	});
	return authorization;
};
