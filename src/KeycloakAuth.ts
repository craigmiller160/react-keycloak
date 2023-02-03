import { KeycloakTokenParsed } from 'keycloak-js';

export type LogoutFn = () => void;
export type StopRefreshFn = () => void;

export type KeycloakAuth = {
	readonly logout: LogoutFn;
	readonly stopRefresh: StopRefreshFn;
	readonly token?: string;
	readonly tokenParsed?: KeycloakTokenParsed;
};
