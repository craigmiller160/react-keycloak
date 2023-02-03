import { describe, it, expect } from 'vitest';
import { DEFAULT_TOKEN, MockKeycloak } from '../mocks/MockKeycloak';
import {
	ACCESS_TOKEN_EXP,
	AUTH_SERVER_URL,
	CLIENT_ID,
	REALM,
	TOKEN_PARSED
} from '../testutils/data';
import { authorizeWithKeycloak } from '../../src/service/AuthorizeWithKeycloak';

describe('AuthorizeWithKeycloak', () => {
	it('handles a successful authentication', async () => {
		MockKeycloak.setAuthResult(true, TOKEN_PARSED);
		const result = await authorizeWithKeycloak({
			accessTokenExpirationSecs: ACCESS_TOKEN_EXP,
			realm: REALM,
			authServerUrl: AUTH_SERVER_URL,
			clientId: CLIENT_ID
		});
		expect(result).toEqual({
			logout: expect.any(Function),
			token: DEFAULT_TOKEN,
			tokenParsed: TOKEN_PARSED
		});
	});

	it('handles a failed authentication', async () => {
		throw new Error();
	});

	it('handles a successful authentication with the required realm roles', async () => {
		throw new Error();
	});

	it('handles a successful authentication with the required client roles', async () => {
		throw new Error();
	});

	it('handles a successful authentication without the roles required roles', async () => {
		throw new Error();
	});
});
