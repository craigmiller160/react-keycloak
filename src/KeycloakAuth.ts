import { KeycloakTokenParsed } from 'keycloak-js';

export type LogoutFn = () => void;

export type KeycloakAuth = {
	readonly logout: LogoutFn;
	readonly token?: string;
	readonly tokenParsed?: KeycloakTokenParsed;
};
