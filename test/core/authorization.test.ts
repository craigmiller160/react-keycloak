import { beforeEach, describe, it, vi } from 'vitest';
import {
	ACCESS_TOKEN_EXP,
	AUTH_SERVER_URL,
	CLIENT_ACCESS_ROLE,
	CLIENT_ID,
	REALM,
	REALM_ACCESS_ROLE,
	TOKEN,
	TOKEN_PARSED,
	UNAUTHORIZED_ERROR
} from '../testutils/data';
import { AuthorizeWithKeycloak } from '../../src/core/types';
import { KeycloakError, KeycloakTokenParsed } from 'keycloak-js';
import { createKeycloakAuthorization } from '../../src/core';
import { MockKeycloak } from '../mocks/MockKeycloak';

const advancePastRefresh = () =>
	vi.advanceTimersByTime(ACCESS_TOKEN_EXP * 1000 + 10);

type Result = {
	readonly token: string;
	readonly tokenParsed: KeycloakTokenParsed;
	readonly error: KeycloakError;
};

const promisify =
	(waitForResultCount: number) =>
	(
		authorize: AuthorizeWithKeycloak
	): Promise<ReadonlyArray<Partial<Result>>> =>
		new Promise((resolve) => {
			const results: Partial<Result>[] = [];
			authorize(
				(token, tokenParsed) => {
					results.push({
						token,
						tokenParsed
					});

					if (results.length >= waitForResultCount) {
						resolve(results);
					}
				},
				(error) => {
					results.push({
						error
					});

					if (results.length >= waitForResultCount) {
						resolve(results);
					}
				}
			);
		});

describe('authorization', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('handles a successful authorization', async () => {
		MockKeycloak.setAuthResults(TOKEN_PARSED);
		const authorize = createKeycloakAuthorization({
			realm: REALM,
			authServerUrl: AUTH_SERVER_URL,
			clientId: CLIENT_ID
		});
		const results = await promisify(1)(authorize);
		expect(results).toEqual([
			{
				token: TOKEN,
				tokenParsed: TOKEN_PARSED
			}
		]);
	});

	it('handles a failed authorization', async () => {
		MockKeycloak.setAuthResults(null);
		const authorize = createKeycloakAuthorization({
			realm: REALM,
			authServerUrl: AUTH_SERVER_URL,
			clientId: CLIENT_ID
		});
		const results = await promisify(1)(authorize);
		expect(results).toEqual([
			{
				error: UNAUTHORIZED_ERROR
			}
		]);
	});

	it('handles a successful authorization, and a successful refresh', async () => {
		MockKeycloak.setAuthResults(TOKEN_PARSED, TOKEN_PARSED);
		const authorize = createKeycloakAuthorization({
			realm: REALM,
			authServerUrl: AUTH_SERVER_URL,
			clientId: CLIENT_ID
		});
		const promise = promisify(2)(authorize);
		advancePastRefresh();
		const results = await promise;
		expect(results).toEqual([
			{
				token: TOKEN,
				tokenParsed: TOKEN_PARSED
			},
			{
				token: TOKEN,
				tokenParsed: TOKEN_PARSED
			}
		]);
	});

	it('handles a successful authorization, and a failed refresh', async () => {
		MockKeycloak.setAuthResults(TOKEN_PARSED, null);
		const authorize = createKeycloakAuthorization({
			realm: REALM,
			authServerUrl: AUTH_SERVER_URL,
			clientId: CLIENT_ID
		});
		const promise = promisify(2)(authorize);
		advancePastRefresh();
		const results = await promise;
		expect(results).toEqual([
			{
				token: TOKEN,
				tokenParsed: TOKEN_PARSED
			},
			{
				error: UNAUTHORIZED_ERROR
			}
		]);
	});

	it('handles a successful authorization with the required realm roles', async () => {
		MockKeycloak.setAuthResults(TOKEN_PARSED);
		const authorize = createKeycloakAuthorization({
			realm: REALM,
			authServerUrl: AUTH_SERVER_URL,
			clientId: CLIENT_ID,
			requiredRoles: {
				realm: [REALM_ACCESS_ROLE]
			}
		});
		const results = await promisify(1)(authorize);
		expect(results).toEqual([
			{
				token: TOKEN,
				tokenParsed: TOKEN_PARSED
			}
		]);
	});

	it('handles a successful authorization with the required client roles', async () => {
		MockKeycloak.setAuthResults(TOKEN_PARSED);
		const authorize = createKeycloakAuthorization({
			realm: REALM,
			authServerUrl: AUTH_SERVER_URL,
			clientId: CLIENT_ID,
			requiredRoles: {
				client: [CLIENT_ACCESS_ROLE]
			}
		});
		const results = await promisify(1)(authorize);
		expect(results).toEqual([
			{
				token: TOKEN,
				tokenParsed: TOKEN_PARSED
			}
		]);
	});

	it('handles a failed authorization because missing a required realm role', async () => {
		throw new Error();
	});

	it('handles a failed authorization because missing a required client role', async () => {
		throw new Error();
	});

	it('handles a successful authorization but a failed refresh because realm role removed', async () => {
		throw new Error();
	});

	it('handles a successful authentication but a failed refresh because client role removed', async () => {
		throw new Error();
	});
});
