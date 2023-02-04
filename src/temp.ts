import { RequiredRoles } from './core-old/types';
import { KeycloakTokenParsed } from 'keycloak-js';
import { KeycloakAuthError } from './errors/KeycloakAuthError';

type KeycloakAuthConfig = {
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

type AuthorizeWithKeycloak = (
	onSuccess: KeycloakAuthSuccessHandler,
	onFailure: KeycloakAuthFailedHandler
) => void;

type CreateKeycloakAuthorization = (
	config: KeycloakAuthConfig
) => AuthorizeWithKeycloak;
