import { beforeEach, describe, it, vi } from 'vitest';
import {
	ACCESS_TOKEN_EXP,
	AUTH_SERVER_URL,
	CLIENT_ID,
	REALM,
	TOKEN,
	TOKEN_PARSED
} from '../testutils/data';
import { AuthorizeWithKeycloak } from '../../src/core/types';
import { KeycloakAuthError } from '../../src/errors/KeycloakAuthError';
import { KeycloakTokenParsed } from 'keycloak-js';
import { createKeycloakAuthorization } from '../../src/core';

const advancePastRefresh = () =>
	vi.advanceTimersByTime(ACCESS_TOKEN_EXP * 1000 + 10);

type Result = {
	readonly token: string;
	readonly tokenParsed: KeycloakTokenParsed;
	readonly error: KeycloakAuthError;
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
		throw new Error();
	});

	it('handles a successful authorization, and a successful refresh', async () => {
		throw new Error();
	});

	it('handles a successful authorization, and a failed refresh', async () => {
		throw new Error();
	});

	it('handles a successful authorization with the required realm roles', async () => {
		throw new Error();
	});

	it('handles a successful authorization with the required client roles', async () => {
		throw new Error();
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
