import { KeycloakError, KeycloakTokenParsed } from 'keycloak-js';

export const CLIENT_ID = 'test-client';
export const AUTH_SERVER_URL = 'https://auth-server.com';
export const ACCESS_TOKEN_EXP = 30;
export const REALM = 'realm';
export const LOCAL_STORAGE_KEY = 'local-storage-key';
export const REALM_ACCESS_ROLE = 'realm-access';
export const CLIENT_ACCESS_ROLE = 'client-access';

export const TOKEN = 'ABCDEFG';
export const TOKEN_PARSED: KeycloakTokenParsed = {
	sub: 'mock-token',
	realm_access: {
		roles: [REALM_ACCESS_ROLE]
	},
	resource_access: {
		[CLIENT_ID]: {
			roles: [CLIENT_ACCESS_ROLE]
		}
	}
};

export const UNAUTHORIZED_ERROR: KeycloakError = {
	error: 'Unauthorized',
	error_description: 'You are unauthorized'
};
