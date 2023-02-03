import { describe, expect, it } from 'vitest';
import { MockKeycloak } from '../mocks/MockKeycloak';
import {
	ACCESS_TOKEN_EXP,
	AUTH_SERVER_URL,
	CLIENT_ACCESS_ROLE,
	CLIENT_ID,
	REALM,
	REALM_ACCESS_ROLE,
	TOKEN,
	TOKEN_PARSED
} from '../testutils/data';
import { authorizeWithKeycloak } from '../../src/service/AuthorizeWithKeycloak';
import { UnauthorizedError } from '../../src/errors/UnauthorizedError';
import { AccessDeniedError } from '../../src/errors/AccessDeniedError';

describe('AuthorizeWithKeycloak', () => {
	it('handles a successful authentication', async () => {
		MockKeycloak.setAuthResult(true);
		const result = await authorizeWithKeycloak({
			accessTokenExpirationSecs: ACCESS_TOKEN_EXP,
			realm: REALM,
			authServerUrl: AUTH_SERVER_URL,
			clientId: CLIENT_ID
		});
		expect(result).toEqual({
			logout: expect.any(Function),
			token: TOKEN,
			tokenParsed: TOKEN_PARSED
		});
	});

	it('handles a failed authentication', async () => {
		MockKeycloak.setAuthResult(false);
		try {
			await authorizeWithKeycloak({
				accessTokenExpirationSecs: ACCESS_TOKEN_EXP,
				realm: REALM,
				authServerUrl: AUTH_SERVER_URL,
				clientId: CLIENT_ID
			});
		} catch (ex) {
			expect(ex).toBeInstanceOf(UnauthorizedError);
		}
	});

	it('handles a successful authentication, and a successful refresh', async () => {
		throw new Error();
	});

	it('handles a successful authentication, and a failed refresh', async () => {
		throw new Error();
	});

	it('handles a successful authentication with the required realm roles', async () => {
		MockKeycloak.setAuthResult(true);
		const result = await authorizeWithKeycloak({
			accessTokenExpirationSecs: ACCESS_TOKEN_EXP,
			realm: REALM,
			authServerUrl: AUTH_SERVER_URL,
			clientId: CLIENT_ID,
			requiredRoles: {
				realm: [REALM_ACCESS_ROLE]
			}
		});
		expect(result).toEqual({
			logout: expect.any(Function),
			token: TOKEN,
			tokenParsed: TOKEN_PARSED
		});
	});

	it('handles a successful authentication with the required client roles', async () => {
		MockKeycloak.setAuthResult(true);
		const result = await authorizeWithKeycloak({
			accessTokenExpirationSecs: ACCESS_TOKEN_EXP,
			realm: REALM,
			authServerUrl: AUTH_SERVER_URL,
			clientId: CLIENT_ID,
			requiredRoles: {
				client: [CLIENT_ACCESS_ROLE]
			}
		});
		expect(result).toEqual({
			logout: expect.any(Function),
			token: TOKEN,
			tokenParsed: TOKEN_PARSED
		});
	});

	it('handles a successful authentication without the roles required roles', async () => {
		MockKeycloak.setAuthResult(true);
		try {
			await authorizeWithKeycloak({
				accessTokenExpirationSecs: ACCESS_TOKEN_EXP,
				realm: REALM,
				authServerUrl: AUTH_SERVER_URL,
				clientId: CLIENT_ID,
				requiredRoles: {
					realm: ['abc']
				}
			});
		} catch (ex) {
			expect(ex).toBeInstanceOf(AccessDeniedError);
		}
	});
});
