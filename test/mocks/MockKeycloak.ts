import type {
	KeycloakConfig,
	KeycloakInitOptions,
	KeycloakTokenParsed
} from 'keycloak-js';
import { TOKEN, TOKEN_PARSED } from '../testutils/data';

export class MockKeycloak {
	static lastConfig?: KeycloakConfig = undefined;
	static lastInit?: KeycloakInitOptions = undefined;
	private static authShouldSucceed = false;

	static setAuthResult(authShouldSucceed: boolean) {
		MockKeycloak.authShouldSucceed = authShouldSucceed;
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
			this.token = TOKEN;
			this.tokenParsed = TOKEN_PARSED;
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
