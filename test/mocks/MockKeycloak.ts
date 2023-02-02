import type { KeycloakConfig, KeycloakInitOptions } from 'keycloak-js';

export class MockKeycloak {
	static lastConfig?: KeycloakConfig = undefined;
	static lastInit?: KeycloakInitOptions;
	constructor(config: KeycloakConfig) {
		MockKeycloak.lastConfig = config;
	}

	init(options: KeycloakInitOptions): Promise<boolean> {
		MockKeycloak.lastInit = options;
		return new Promise((resolve) => resolve(true));
	}
}
