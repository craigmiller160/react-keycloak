import { KeycloakTokenParsed } from 'keycloak-js';

export type KeycloakAuthStatus = 'authorized' | 'unauthorized';

export type LogoutFn = () => void;

export type KeycloakAuth = {
	readonly authStatus: KeycloakAuthStatus;
	readonly logout: LogoutFn;
	readonly token?: string;
	readonly tokenParsed?: KeycloakTokenParsed;
};
