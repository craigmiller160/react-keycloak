import {
	AuthorizeWithKeycloak,
	KeycloakAuthorization,
	KeycloakAuthSubscription
} from './types';
import Keycloak, { KeycloakTokenParsed } from 'keycloak-js';
import { KeycloakAuthConfig } from '../service/KeycloakAuthConfig';
import { UnauthorizedError } from '../errors/UnauthorizedError';

type AuthState = 'authorizing' | 'authorized';

type AuthContext = {
	readonly state: AuthState;
	readonly config: KeycloakAuthConfig;
	readonly keycloak: Keycloak;
};

type InternalAuthorization = KeycloakAuthorization & {
	isStopped: boolean;
	token?: string;
	tokenParsed?: KeycloakTokenParsed;
	readonly subscriptions: KeycloakAuthSubscription[];
};

const handleAuthorizing = (context: AuthContext): Promise<AuthContext> =>
	context.keycloak.init({ onLoad: 'login-required' }).then((isSuccess) => {
		if (isSuccess) {
			return Promise.resolve({
				...context,
				state: 'authorized'
			});
		}
		return Promise.reject(new UnauthorizedError());
	});

const handleAuthStep = (context: AuthContext): Promise<AuthContext> => {
	switch (context.state) {
		case 'authorizing':
			return handleAuthorizing(context).then(handleAuthStep);
		case 'authorized':
		default:
			return Promise.resolve(context);
	}
};

export const authorizeWithKeycloak: AuthorizeWithKeycloak = (config) => {
	const keycloak = new Keycloak({
		url: config.authServerUrl,
		realm: config.realm,
		clientId: config.clientId
	});
	const authorization: InternalAuthorization = {
		isStopped: false,
		subscriptions: [],
		stop() {
			this.subscriptions.splice(0, this.subscriptions.length);
			this.isStopped = true;
		},
		logout: keycloak.logout
	};
	const promise = handleAuthStep({
		config,
		keycloak,
		state: 'authorizing'
	});
	throw new Error();
};
