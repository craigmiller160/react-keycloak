import { AuthorizeWithKeycloak, KeycloakAuthConfig } from './types';
import Keycloak from 'keycloak-js';

export const createKeycloakAuthorization = (
	config: KeycloakAuthConfig
): AuthorizeWithKeycloak => {
	const keycloak = new Keycloak({
		url: config.authServerUrl,
		realm: config.realm,
		clientId: config.clientId
	});
	return (onSuccess, onFailure) => {
		keycloak.onAuthSuccess = () => {
			// TODO check for roles
			onSuccess(keycloak.token!, keycloak.tokenParsed!);
			// TODO trigger the refresh
		};

		keycloak.onAuthRefreshSuccess = () => {
			// TODO check for roles
			onSuccess(keycloak.token!, keycloak.tokenParsed!);
			// TODO trigger the next refresh
		};

		keycloak.onAuthError = onFailure;
		keycloak.onAuthRefreshError = () =>
			onFailure({
				error: 'Refresh Error',
				error_description: 'Failed to refresh token'
			});
	};
};
