import { AuthorizeWithKeycloak, KeycloakAuthConfig } from './types';
import Keycloak from 'keycloak-js';
import { newDate } from '../utils/newDate';

export const createKeycloakAuthorization = (
	config: KeycloakAuthConfig
): AuthorizeWithKeycloak => {
	const keycloak = new Keycloak({
		url: config.authServerUrl,
		realm: config.realm,
		clientId: config.clientId
	});
	return (onSuccess, onFailure) => {
		const handleOnSuccess = () => {
			// TODO check for roles
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			onSuccess(keycloak.token!, keycloak.tokenParsed!);
			const current = newDate().getTime();
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			const exp = keycloak.tokenParsed!.exp! * 1000;
			setTimeout(() => keycloak.updateToken(40), exp - current - 30_000);
		};

		keycloak.onAuthSuccess = handleOnSuccess;
		keycloak.onAuthRefreshSuccess = handleOnSuccess;
		keycloak.onAuthError = onFailure;
		keycloak.onAuthRefreshError = () =>
			onFailure({
				error: 'Refresh Error',
				error_description: 'Failed to refresh token'
			});

		keycloak.init({ onLoad: 'login-required' });
	};
};
