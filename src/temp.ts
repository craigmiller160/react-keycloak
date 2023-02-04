// TODO delete this whole file
import { KeycloakAuthConfig } from './service/KeycloakAuthConfig';
import { KeycloakTokenParsed } from 'keycloak-js';

type KeycloakAuthSubscription = {
	readonly unsubscribe: () => void;
};

type KeycloakAuthSuccessFn = (
	token: string,
	tokenParsed: KeycloakTokenParsed
) => void;
type KeycloakAuthFailedFn = (error: Error) => void;

type KeycloakAuthorization = {
	readonly subscribe: (
		onSuccess: KeycloakAuthSuccessFn,
		onFailure: KeycloakAuthFailedFn
	) => KeycloakAuthSubscription;
	readonly stopRefresh: () => void;
	readonly logout: () => void;
};

const authorizeWithKeycloak = (
	config: KeycloakAuthConfig
): KeycloakAuthorization => {};

const authorization = authorizeWithKeycloak({
	clientId: '',
	authServerUrl: '',
	accessTokenExpirationSecs: 0,
	realm: ''
});

const subscription = authorization.subscribe(
	() => null,
	() => null
);
