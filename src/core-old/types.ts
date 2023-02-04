import { KeycloakTokenParsed } from 'keycloak-js';
import { KeycloakAuthError } from '../errors/KeycloakAuthError';

export type RequiredRoles = {
	readonly realm: ReadonlyArray<string>;
	readonly client: ReadonlyArray<string>;
};

export type KeycloakAuthConfig = {
	readonly accessTokenExpirationSecs: number;
	readonly realm: string;
	readonly authServerUrl: string;
	readonly clientId: string;
	readonly requiredRoles?: Partial<RequiredRoles>;
};

export type KeycloakAuthSuccessHandler = (
	token: string,
	tokenParsed: KeycloakTokenParsed
) => void;
export type KeycloakAuthFailedHandler = (error: KeycloakAuthError) => void;
export type KeycloakAuthSubscription = {
	readonly id: string;
	readonly onSuccess: KeycloakAuthSuccessHandler;
	readonly onFailure: KeycloakAuthFailedHandler;
	readonly unsubscribe: (stopAuthorization?: boolean) => void;
};
export type KeycloakAuthSubscribe = (
	onSuccess: KeycloakAuthSuccessHandler,
	onFailure: KeycloakAuthFailedHandler
) => KeycloakAuthSubscription;

export type KeycloakAuthorization = {
	readonly subscribe: KeycloakAuthSubscribe;
	readonly stop: () => void;
	readonly logout: () => void;
};

export type AuthorizeWithKeycloak = (
	config: KeycloakAuthConfig
) => KeycloakAuthorization;