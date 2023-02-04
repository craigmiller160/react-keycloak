import type {
	KeycloakConfig,
	KeycloakInitOptions,
	KeycloakTokenParsed
} from 'keycloak-js';
import { TOKEN, TOKEN_PARSED } from '../testutils/data';

export class MockKeycloak {
	static lastConfig?: KeycloakConfig = undefined;
	static lastInit?: KeycloakInitOptions = undefined;
	private static authResults: ReadonlyArray<boolean> = [];

	static setAuthResults(...authShouldSucceed: ReadonlyArray<boolean>) {
		MockKeycloak.authResults = authShouldSucceed;
	}

	static reset() {
		MockKeycloak.lastConfig = undefined;
		MockKeycloak.lastInit = undefined;
		MockKeycloak.authResults = [];
	}

	token?: string;
	tokenParsed?: KeycloakTokenParsed;
	private currentAuthResult = 0;
	constructor(config: KeycloakConfig) {
		MockKeycloak.lastConfig = config;
	}

	init(options: KeycloakInitOptions): Promise<boolean> {
		MockKeycloak.lastInit = options;
		if (MockKeycloak.authResults[this.currentAuthResult] === undefined) {
			throw new Error('Must initialize the static auth results');
		}

		if (MockKeycloak.authResults[this.currentAuthResult]) {
			this.token = TOKEN;
			this.tokenParsed = TOKEN_PARSED;
		} else {
			this.token = undefined;
			this.tokenParsed = undefined;
		}

		this.currentAuthResult++;

		return new Promise((resolve) =>
			resolve(MockKeycloak.authResults[this.currentAuthResult])
		);
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	updateToken(minValidity: number): Promise<boolean> {
		if (MockKeycloak.authResults[this.currentAuthResult] === undefined) {
			throw new Error(
				'Must initialize enough static auth results for all refreshes'
			);
		}

		if (MockKeycloak.authResults[this.currentAuthResult]) {
			this.token = TOKEN;
			this.tokenParsed = TOKEN_PARSED;
		} else {
			this.token = undefined;
			this.tokenParsed = undefined;
		}

		this.currentAuthResult++;
		return new Promise((resolve) =>
			resolve(MockKeycloak.authResults[this.currentAuthResult])
		);
	}

	// eslint-disable-next-line @typescript-eslint/no-empty-function
	logout() {}
}
