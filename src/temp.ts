// TODO delete this whole file
import { KeycloakAuthConfig } from './service/KeycloakAuthConfig';
import { KeycloakTokenParsed } from 'keycloak-js';

type KeycloakAuthSubscription = {
	readonly unsubscribe: () => void;
};

type KeycloakAuthorization = {
	readonly subscribe: (
		fn: (token: string, tokenParsed: KeycloakTokenParsed) => void
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

const result = authorization.subscribe(() => null);
