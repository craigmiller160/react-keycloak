import { AuthorizeWithKeycloak } from './types';
import Keycloak from 'keycloak-js';
import { KeycloakAuthConfig } from '../service/KeycloakAuthConfig';
import { InternalAuthorization } from './InternalAuthorization';

type AuthState = 'authorizing' | 'authorized' | 'unauthorized';

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
				return Promise.resolve<AuthContext>({
					...context,
					state: 'authorized'
				});
			}
			return Promise.resolve<AuthContext>({
				...context,
				state: 'unauthorized'
			});
		});

const handleAuthorized = (context: AuthContext): Promise<AuthContext> => {
	context.authorization.emitAuthorized();
	return Promise.resolve(context);
};

const handleUnauthorized = (context: AuthContext): Promise<AuthContext> => {
	context.authorization.emitUnauthorized();
	return Promise.resolve(context);
};

const handleAuthStep = (context: AuthContext): Promise<AuthContext> => {
	switch (context.state) {
		case 'authorizing':
			return handleAuthorizing(context).then(handleAuthStep);
		case 'authorized':
			return handleAuthorized(context);
		case 'unauthorized':
		default:
			return handleUnauthorized(context);
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
