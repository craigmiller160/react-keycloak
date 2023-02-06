import { KeycloakAuthStatus } from './types';

export const isPreAuthorization = (status: KeycloakAuthStatus): boolean =>
	['pre-auth', 'authorizing'].includes(status);

export const isPostAuthorization = (status: KeycloakAuthStatus): boolean =>
	['authorized', 'unauthorized'].includes(status);
