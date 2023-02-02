import type { KeycloakConfig, KeycloakInitOptions } from 'keycloak-js';

export const DEFAULT_TOKEN = 'ABCDEFG';

export class MockKeycloak {
	static lastConfig?: KeycloakConfig = undefined;
	static lastInit?: KeycloakInitOptions;
	token: string;
	constructor(config: KeycloakConfig) {
		MockKeycloak.lastConfig = config;
		this.token = DEFAULT_TOKEN;
	}

	init(options: KeycloakInitOptions): Promise<boolean> {
		MockKeycloak.lastInit = options;
		return new Promise((resolve) => resolve(true));
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	updateToken(minValidity: number): Promise<boolean> {
		return new Promise((resolve) => resolve(true));
	}
}
