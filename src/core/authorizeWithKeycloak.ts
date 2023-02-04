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

type AuthState = 'authorizing' | 'authorized';

type AuthContext = {
	readonly state: AuthState;
	readonly config: KeycloakAuthConfig;
	readonly keycloak: Keycloak;
};

class InternalAuthorization implements KeycloakAuthorization {
	isStopped = false;
	private token?: string;
	private tokenParsed?: KeycloakTokenParsed;

	private readonly subscriptions: KeycloakAuthSubscription[] = [];
	private readonly keycloak: Keycloak;
	constructor(keycloak: Keycloak) {
		this.keycloak = keycloak;
	}
	stop() {
		this.subscriptions.splice(0, this.subscriptions.length);
		this.isStopped = true;
	}
	subscribe(
		onSuccess: KeycloakAuthSuccessHandler,
		onFailure: KeycloakAuthFailedHandler
	) {
		const id = nanoid();
		if (this.isStopped) {
			onFailure(new AuthorizationStoppedError());
			return {
				onSuccess,
				onFailure,
				unsubscribe: () => null,
				id
			};
		}

		const unsubscribe = (stopAuthorization?: boolean) => {
			const index = this.subscriptions.findIndex((sub) => sub.id === id);
			if (index >= 0) {
				this.subscriptions.splice(index, 1);
			}

			if (stopAuthorization) {
				this.stop();
			}
		};
		const subscription: KeycloakAuthSubscription = {
			onSuccess,
			onFailure,
			id,
			unsubscribe
		};
		this.subscriptions.push(subscription);
		return subscription;
	}

	logout() {
		this.keycloak.logout();
	}
}

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
		logout: keycloak.logout,
		subscribe(onSuccess, onFailure) {
			const subscription: KeycloakAuthSubscription = {
				onSuccess,
				onFailure,
				id: nanoid(),
				unsubscribe(stopAuth) {}
			};
			this.subscriptions.push(subscription);
			return subscription;
		}
	};
	const promise = handleAuthStep({
		config,
		keycloak,
		state: 'authorizing'
	});
	return authorization;
};
