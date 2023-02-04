import type {
	KeycloakConfig,
	KeycloakInitOptions,
	KeycloakTokenParsed
} from 'keycloak-js';
import { TOKEN, TOKEN_PARSED } from '../testutils/data';

export class MockKeycloak {
	static lastConfig?: KeycloakConfig = undefined;
	static lastInit?: KeycloakInitOptions = undefined;
	private static authResults: ReadonlyArray<KeycloakTokenParsed | null> = [];

	static setAuthResults(
		...authResults: ReadonlyArray<KeycloakTokenParsed | null>
	) {
		MockKeycloak.authResults = authResults;
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

		const authSuccess =
			MockKeycloak.authResults[this.currentAuthResult] != null;
		if (authSuccess) {
			this.token = TOKEN;
			this.tokenParsed = TOKEN_PARSED;
		} else {
			this.token = undefined;
			this.tokenParsed = undefined;
		}

		this.currentAuthResult++;

		return new Promise((resolve) => resolve(authSuccess));
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	updateToken(minValidity: number): Promise<boolean> {
		if (MockKeycloak.authResults[this.currentAuthResult] === undefined) {
			throw new Error(
				'Must initialize enough static auth results for all refreshes'
			);
		}

		const authSuccess =
			MockKeycloak.authResults[this.currentAuthResult] != null;
		if (authSuccess) {
			this.token = TOKEN;
			this.tokenParsed = TOKEN_PARSED;
		} else {
			this.token = undefined;
			this.tokenParsed = undefined;
		}

		this.currentAuthResult++;
		return new Promise((resolve) => resolve(authSuccess));
	}

	// eslint-disable-next-line @typescript-eslint/no-empty-function
	logout() {}
}
