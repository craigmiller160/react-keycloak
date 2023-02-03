import type {
	KeycloakConfig,
	KeycloakInitOptions,
	KeycloakTokenParsed
} from 'keycloak-js';

export const DEFAULT_TOKEN = 'ABCDEFG';

const DEFAULT_TOKEN_PARSED: KeycloakTokenParsed = {
	sub: 'mock-token'
};

export class MockKeycloak {
	static lastConfig?: KeycloakConfig = undefined;
	static lastInit?: KeycloakInitOptions = undefined;
	static authSuccess = false;

	static reset() {
		MockKeycloak.lastConfig = undefined;
		MockKeycloak.lastInit = undefined;
		MockKeycloak.authSuccess = false;
	}

	token?: string;
	tokenParsed?: KeycloakTokenParsed;
	constructor(config: KeycloakConfig) {
		MockKeycloak.lastConfig = config;
	}

	init(options: KeycloakInitOptions): Promise<boolean> {
		MockKeycloak.lastInit = options;
		if (MockKeycloak.authSuccess) {
			this.token = DEFAULT_TOKEN;
			this.tokenParsed = DEFAULT_TOKEN_PARSED;
		}

		return new Promise((resolve) => resolve(MockKeycloak.authSuccess));
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	updateToken(minValidity: number): Promise<boolean> {
		return new Promise((resolve) => resolve(true));
	}
}
