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
	private static authShouldSucceed = false;
	private static tokenParsed?: KeycloakTokenParsed;

	static setAuthResult(
		authShouldSucceed: boolean,
		tokenParsed?: KeycloakTokenParsed
	) {
		if (authShouldSucceed && !tokenParsed) {
			throw new Error(
				'Must specify the tokenParsed argument if authorization should succeed'
			);
		}
		MockKeycloak.authShouldSucceed = authShouldSucceed;
		MockKeycloak.tokenParsed = tokenParsed;
	}

	static reset() {
		MockKeycloak.lastConfig = undefined;
		MockKeycloak.lastInit = undefined;
		MockKeycloak.authShouldSucceed = false;
		MockKeycloak.tokenParsed = undefined;
	}

	token?: string;
	tokenParsed?: KeycloakTokenParsed;
	constructor(config: KeycloakConfig) {
		MockKeycloak.lastConfig = config;
	}

	init(options: KeycloakInitOptions): Promise<boolean> {
		MockKeycloak.lastInit = options;
		if (MockKeycloak.authShouldSucceed) {
			this.token = DEFAULT_TOKEN;
			this.tokenParsed = DEFAULT_TOKEN_PARSED;
		}

		return new Promise((resolve) =>
			resolve(MockKeycloak.authShouldSucceed)
		);
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	updateToken(minValidity: number): Promise<boolean> {
		return new Promise((resolve) => resolve(true));
	}

	// eslint-disable-next-line @typescript-eslint/no-empty-function
	logout() {}
}
