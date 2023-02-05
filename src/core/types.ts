import { KeycloakError, KeycloakTokenParsed } from 'keycloak-js';

export type RequiredRoles = {
	readonly realm: ReadonlyArray<string>;
	readonly client: ReadonlyArray<string>;
};

export type KeycloakAuthConfig = {
	readonly realm: string;
	readonly authServerUrl: string;
	readonly clientId: string;
	readonly requiredRoles?: Partial<RequiredRoles>;
};

export type KeycloakAuthSuccessHandler = (
	token: string,
	tokenParsed: KeycloakTokenParsed
) => void;
export type KeycloakAuthFailedHandler = (error: KeycloakError) => void;

export type AuthorizeWithKeycloak = (
	onSuccess: KeycloakAuthSuccessHandler,
	onFailure: KeycloakAuthFailedHandler
) => void;

export type Logout = () => void;

export type CreateKeycloakAuthorization = (
	config: KeycloakAuthConfig
) => [AuthorizeWithKeycloak, Logout];
