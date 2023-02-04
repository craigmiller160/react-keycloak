import { describe, it, expect, afterEach, vi, beforeEach } from 'vitest';
import {
	KeycloakAuthorization,
	KeycloakAuthSubscribe,
	KeycloakAuthSubscription
} from '../../src/core/types';
import { MockKeycloak } from '../mocks/MockKeycloak';
import { authorizeWithKeycloak } from '../../src/core/authorizeWithKeycloak';
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
import { KeycloakAuthError } from '../../src/errors/KeycloakAuthError';
import { KeycloakTokenParsed } from 'keycloak-js';

type AuthResult = {
	readonly token: string;
	readonly tokenParsed: KeycloakTokenParsed;
	readonly error: KeycloakAuthError;
};

type SubscriptionResult = {
	readonly subscription: KeycloakAuthSubscription;
	readonly results: ReadonlyArray<Partial<AuthResult>>;
};

const subscriptionToPromise =
	(waitForResultCount: number) =>
	(subscribe: KeycloakAuthSubscribe): Promise<SubscriptionResult> =>
		new Promise((resolve) => {
			const results: Partial<AuthResult>[] = [];
			const subscription = subscribe(
				(token, tokenParsed) => {
					results.push({
						token,
						tokenParsed
					});
					if (results.length >= waitForResultCount) {
						resolve({
							subscription,
							results
						});
					}
				},
				(error) => {
					results.push({
						error
					});
					if (results.length >= waitForResultCount) {
						resolve({
							subscription,
							results
						});
					}
				}
			);
		});

const advancePastRefresh = () =>
	vi.advanceTimersByTime(ACCESS_TOKEN_EXP * 1000 + 10);

describe('authorizeWithKeycloak', () => {
	let authorization: KeycloakAuthorization | undefined = undefined;
	beforeEach(() => {
		vi.useFakeTimers();
	});
	afterEach(() => {
		if (authorization) {
			authorization.stop();
		}
		vi.useRealTimers();
	});

	it('passes a successful authorization to the subscription', async () => {
		MockKeycloak.setAuthResults(TOKEN_PARSED);
		authorization = authorizeWithKeycloak({
			accessTokenExpirationSecs: ACCESS_TOKEN_EXP,
			realm: REALM,
			authServerUrl: AUTH_SERVER_URL,
			clientId: CLIENT_ID
		});
		const result = await subscriptionToPromise(1)(authorization.subscribe);
		expect(result.results).toEqual([
			{
				token: TOKEN,
				tokenParsed: TOKEN_PARSED
			}
		]);
	});

	it('has an error during authorization', async () => {
		throw new Error();
	});

	it('passes an unauthorized error to the subscription', async () => {
		MockKeycloak.setAuthResults(null);
		authorization = authorizeWithKeycloak({
			accessTokenExpirationSecs: ACCESS_TOKEN_EXP,
			realm: REALM,
			authServerUrl: AUTH_SERVER_URL,
			clientId: CLIENT_ID
		});
		const result = await subscriptionToPromise(1)(authorization.subscribe);
		expect(result.results).toEqual([
			{
				error: expect.objectContaining({
					type: 'unauthorized'
				})
			}
		]);

		expect(authorization).toEqual(
			expect.objectContaining({
				subscriptions: []
			})
		);
		const result2 = await subscriptionToPromise(1)(authorization.subscribe);
		expect(result2.results).toEqual([
			{
				error: expect.objectContaining({
					type: 'authorization-stopped'
				})
			}
		]);
	});

	it('passes a successful authorization and a successful refresh to the subscription', async () => {
		MockKeycloak.setAuthResults(TOKEN_PARSED, TOKEN_PARSED);
		authorization = authorizeWithKeycloak({
			accessTokenExpirationSecs: ACCESS_TOKEN_EXP,
			realm: REALM,
			authServerUrl: AUTH_SERVER_URL,
			clientId: CLIENT_ID
		});
		const promise = subscriptionToPromise(2)(authorization.subscribe);
		advancePastRefresh();
		const result = await promise;
		expect(result.results).toEqual([
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

	it('passes a successful authorization and an unauthorized refresh to the subscription', async () => {
		MockKeycloak.setAuthResults(TOKEN_PARSED, null);
		authorization = authorizeWithKeycloak({
			accessTokenExpirationSecs: ACCESS_TOKEN_EXP,
			realm: REALM,
			authServerUrl: AUTH_SERVER_URL,
			clientId: CLIENT_ID
		});
		const promise = subscriptionToPromise(2)(authorization.subscribe);
		advancePastRefresh();
		const result = await promise;
		expect(result.results).toEqual([
			{
				token: TOKEN,
				tokenParsed: TOKEN_PARSED
			},
			{
				error: expect.objectContaining({
					type: 'unauthorized'
				})
			}
		]);

		expect(authorization).toEqual(
			expect.objectContaining({
				subscriptions: []
			})
		);
		const result2 = await subscriptionToPromise(1)(authorization.subscribe);
		expect(result2.results).toEqual([
			{
				error: expect.objectContaining({
					type: 'authorization-stopped'
				})
			}
		]);
	});

	it('passes a successful authorization and an access denied refresh to the subscription', async () => {
		const differentRealmRoleToken: KeycloakTokenParsed = {
			...TOKEN_PARSED,
			realm_access: {
				roles: ['abc']
			}
		};
		MockKeycloak.setAuthResults(TOKEN_PARSED, differentRealmRoleToken);
		authorization = authorizeWithKeycloak({
			accessTokenExpirationSecs: ACCESS_TOKEN_EXP,
			realm: REALM,
			authServerUrl: AUTH_SERVER_URL,
			clientId: CLIENT_ID,
			requiredRoles: {
				realm: [REALM_ACCESS_ROLE]
			}
		});

		const promise = subscriptionToPromise(2)(authorization.subscribe);
		advancePastRefresh();
		const result = await promise;
		expect(result.results).toEqual([
			{
				token: TOKEN,
				tokenParsed: TOKEN_PARSED
			},
			{
				error: expect.objectContaining({
					type: 'access-denied'
				})
			}
		]);

		expect(authorization).toEqual(
			expect.objectContaining({
				subscriptions: []
			})
		);
		const result2 = await subscriptionToPromise(1)(authorization.subscribe);
		expect(result2.results).toEqual([
			{
				error: expect.objectContaining({
					type: 'authorization-stopped'
				})
			}
		]);
	});

	it('passes a successful authorization to the subscription, then unsubscribes from authorization updates', async () => {
		MockKeycloak.setAuthResults(TOKEN_PARSED, TOKEN_PARSED);
		authorization = authorizeWithKeycloak({
			accessTokenExpirationSecs: ACCESS_TOKEN_EXP,
			realm: REALM,
			authServerUrl: AUTH_SERVER_URL,
			clientId: CLIENT_ID
		});
		const result = await subscriptionToPromise(1)(authorization.subscribe);
		expect(result.results).toEqual([
			{
				token: TOKEN,
				tokenParsed: TOKEN_PARSED
			}
		]);
		expect(authorization).toEqual(
			expect.objectContaining({
				subscriptions: [result.subscription]
			})
		);
		result.subscription.unsubscribe();
		expect(authorization).toEqual(
			expect.objectContaining({
				subscriptions: []
			})
		);

		const promise2 = subscriptionToPromise(2)(authorization.subscribe);
		advancePastRefresh();
		const result2 = await promise2;
		expect(result2.results).toEqual([
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

	it('passes a successful authorization to the subscription, then unsubscribes AND stops authorization at the same time', async () => {
		MockKeycloak.setAuthResults(TOKEN_PARSED);
		authorization = authorizeWithKeycloak({
			accessTokenExpirationSecs: ACCESS_TOKEN_EXP,
			realm: REALM,
			authServerUrl: AUTH_SERVER_URL,
			clientId: CLIENT_ID
		});
		const result = await subscriptionToPromise(1)(authorization.subscribe);
		expect(result.results).toEqual([
			{
				token: TOKEN,
				tokenParsed: TOKEN_PARSED
			}
		]);
		expect(authorization).toEqual(
			expect.objectContaining({
				subscriptions: [result.subscription]
			})
		);
		result.subscription.unsubscribe(true);
		expect(authorization).toEqual(
			expect.objectContaining({
				subscriptions: []
			})
		);

		const result2 = await subscriptionToPromise(1)(authorization.subscribe);
		expect(authorization).toEqual(
			expect.objectContaining({
				subscriptions: []
			})
		);
		expect(result2.results).toEqual([
			{
				error: expect.objectContaining({
					type: 'authorization-stopped'
				})
			}
		]);
	});

	it('passes a successful authorization to the subscription, then stops authorization', async () => {
		MockKeycloak.setAuthResults(TOKEN_PARSED);
		authorization = authorizeWithKeycloak({
			accessTokenExpirationSecs: ACCESS_TOKEN_EXP,
			realm: REALM,
			authServerUrl: AUTH_SERVER_URL,
			clientId: CLIENT_ID
		});
		const result = await subscriptionToPromise(1)(authorization.subscribe);
		expect(result.results).toEqual([
			{
				token: TOKEN,
				tokenParsed: TOKEN_PARSED
			}
		]);
		expect(authorization).toEqual(
			expect.objectContaining({
				subscriptions: [result.subscription]
			})
		);
		authorization.stop();
		expect(authorization).toEqual(
			expect.objectContaining({
				subscriptions: []
			})
		);

		const result2 = await subscriptionToPromise(1)(authorization.subscribe);
		expect(authorization).toEqual(
			expect.objectContaining({
				subscriptions: []
			})
		);
		expect(result2.results).toEqual([
			{
				error: expect.objectContaining({
					type: 'authorization-stopped'
				})
			}
		]);
	});

	it('passes a successful authorization with the required realm roles to the subscription', async () => {
		MockKeycloak.setAuthResults(TOKEN_PARSED);
		authorization = authorizeWithKeycloak({
			accessTokenExpirationSecs: ACCESS_TOKEN_EXP,
			realm: REALM,
			authServerUrl: AUTH_SERVER_URL,
			clientId: CLIENT_ID,
			requiredRoles: {
				realm: [REALM_ACCESS_ROLE]
			}
		});
		const result = await subscriptionToPromise(1)(authorization.subscribe);
		expect(result.results).toEqual([
			{
				token: TOKEN,
				tokenParsed: TOKEN_PARSED
			}
		]);
	});

	it('passes a successful authorization with the required client roles to the subscription', async () => {
		MockKeycloak.setAuthResults(TOKEN_PARSED);
		authorization = authorizeWithKeycloak({
			accessTokenExpirationSecs: ACCESS_TOKEN_EXP,
			realm: REALM,
			authServerUrl: AUTH_SERVER_URL,
			clientId: CLIENT_ID,
			requiredRoles: {
				client: [CLIENT_ACCESS_ROLE]
			}
		});
		const result = await subscriptionToPromise(1)(authorization.subscribe);
		expect(result.results).toEqual([
			{
				token: TOKEN,
				tokenParsed: TOKEN_PARSED
			}
		]);
	});

	it('passes an access denied error due to missing required realm role to the subscription', async () => {
		MockKeycloak.setAuthResults(TOKEN_PARSED);
		authorization = authorizeWithKeycloak({
			accessTokenExpirationSecs: ACCESS_TOKEN_EXP,
			realm: REALM,
			authServerUrl: AUTH_SERVER_URL,
			clientId: CLIENT_ID,
			requiredRoles: {
				realm: ['abc']
			}
		});
		const result = await subscriptionToPromise(1)(authorization.subscribe);
		expect(result.results).toEqual([
			{
				error: expect.objectContaining({
					type: 'access-denied'
				})
			}
		]);

		expect(authorization).toEqual(
			expect.objectContaining({
				subscriptions: []
			})
		);
		const result2 = await subscriptionToPromise(1)(authorization.subscribe);
		expect(result2.results).toEqual([
			{
				error: expect.objectContaining({
					type: 'authorization-stopped'
				})
			}
		]);
	});

	it('passes an access denied error due to missing required client role to the subscription', async () => {
		MockKeycloak.setAuthResults(TOKEN_PARSED);
		authorization = authorizeWithKeycloak({
			accessTokenExpirationSecs: ACCESS_TOKEN_EXP,
			realm: REALM,
			authServerUrl: AUTH_SERVER_URL,
			clientId: CLIENT_ID,
			requiredRoles: {
				client: ['abc']
			}
		});
		const result = await subscriptionToPromise(1)(authorization.subscribe);
		expect(result.results).toEqual([
			{
				error: expect.objectContaining({
					type: 'access-denied'
				})
			}
		]);

		expect(authorization).toEqual(
			expect.objectContaining({
				subscriptions: []
			})
		);
		const result2 = await subscriptionToPromise(1)(authorization.subscribe);
		expect(result2.results).toEqual([
			{
				error: expect.objectContaining({
					type: 'authorization-stopped'
				})
			}
		]);
	});
});
