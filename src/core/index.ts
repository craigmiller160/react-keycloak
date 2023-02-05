import {
	AuthorizeWithKeycloak,
	CreateKeycloakAuthorization,
	KeycloakAuthConfig,
	KeycloakAuthFailedHandler,
	KeycloakAuthSuccessHandler,
	RequiredRoles
} from './types';
import Keycloak, { KeycloakError } from 'keycloak-js';
import { newDate } from '../utils/newDate';
import { AUTH_SERVER_URL } from './constants';

const hasRequiredRoles = (
	keycloak: Keycloak,
	clientId: string,
	requiredRoles?: Partial<RequiredRoles>
): boolean => {
	const hasRequiredRealmRoles =
		(requiredRoles?.realm ?? []).filter(
			(role) => !keycloak.hasRealmRole(role)
		).length === 0;
	const hasRequiredClientRoles =
		(requiredRoles?.client ?? []).filter(
			(role) => !keycloak.hasResourceRole(role, clientId)
		).length === 0;
	return hasRequiredRealmRoles && hasRequiredClientRoles;
};

const createHandleOnSuccess =
	(keycloak: Keycloak, config: KeycloakAuthConfig) =>
	(
		onSuccess: KeycloakAuthSuccessHandler,
		onFailure: KeycloakAuthFailedHandler
	) =>
	() => {
		if (
			!hasRequiredRoles(keycloak, config.clientId, config.requiredRoles)
		) {
			onFailure({
				error: 'Access Denied',
				error_description: 'Your access to this app is denied'
			});
			return;
		}

		if (config.localStorageKey) {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			localStorage.setItem(config.localStorageKey, keycloak.token!);
		}

		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		onSuccess(keycloak.token!, keycloak.tokenParsed!);

		const current = newDate().getTime();
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const exp = keycloak.tokenParsed!.exp! * 1000;

		setTimeout(() => keycloak.updateToken(40), exp - current - 30_000);
	};

const createHandleOnFailure =
	(config: KeycloakAuthConfig) =>
	(onFailure: KeycloakAuthFailedHandler) =>
	(error: KeycloakError) => {
		if (config.localStorageKey) {
			localStorage.removeItem(config.localStorageKey);
		}
		onFailure(error);
	};

export const createKeycloakAuthorization: CreateKeycloakAuthorization = (
	config: KeycloakAuthConfig
) => {
	const keycloak = new Keycloak({
		url: config.authServerUrl ?? AUTH_SERVER_URL,
		realm: config.realm,
		clientId: config.clientId
	});
	const handleOnFailure = createHandleOnFailure(config);
	const handleOnSuccess = createHandleOnSuccess(keycloak, config);
	const authorize: AuthorizeWithKeycloak = (onSuccess, onFailure) => {
		keycloak.onAuthSuccess = handleOnSuccess(
			onSuccess,
			handleOnFailure(onFailure)
		);
		keycloak.onAuthRefreshSuccess = handleOnSuccess(
			onSuccess,
			handleOnFailure(onFailure)
		);
		keycloak.onAuthError = handleOnFailure(onFailure);
		keycloak.onAuthRefreshError = () =>
			handleOnFailure(onFailure)({
				error: 'Refresh Error',
				error_description: 'Failed to refresh token'
			});

		keycloak.init({ onLoad: 'login-required' });
	};

	return [authorize, keycloak.logout];
};
