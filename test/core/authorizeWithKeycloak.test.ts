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

type SubscriptionHolder = {
	readonly subscriptions: KeycloakAuthSubscription[];
};

type SubscriptionResult = {
	readonly token: string;
	readonly tokenParsed: KeycloakTokenParsed;
	readonly error: KeycloakAuthError;
};

const subscriptionToPromise =
	(waitForResultCount: number) =>
	(
		subscribe: KeycloakAuthSubscribe
	): Promise<Partial<SubscriptionResult>[]> =>
		new Promise((resolve) => {
			const results: Partial<SubscriptionResult>[] = [];
			subscribe(
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

describe('authorizeWithKeycloak', () => {
	let authorization: KeycloakAuthorization | undefined = undefined;
	beforeEach(() => {
		vi.useFakeTimers();
	});
	afterEach(() => {
		if (authorization) {
			authorization.stopRefreshAndSubscriptions();
		}
		vi.useRealTimers();
	});

	it('passes a successful authorization to the subscription', async () => {
		MockKeycloak.setAuthResults(true);
		authorization = authorizeWithKeycloak({
			accessTokenExpirationSecs: ACCESS_TOKEN_EXP,
			realm: REALM,
			authServerUrl: AUTH_SERVER_URL,
			clientId: CLIENT_ID
		});
		const results = await subscriptionToPromise(1)(authorization.subscribe);
		expect(results).toEqual([
			{
				token: TOKEN,
				tokenParsed: TOKEN_PARSED
			}
		]);
	});

	it('passes an unauthorized error to the subscription', async () => {
		MockKeycloak.setAuthResults(false);
		authorization = authorizeWithKeycloak({
			accessTokenExpirationSecs: ACCESS_TOKEN_EXP,
			realm: REALM,
			authServerUrl: AUTH_SERVER_URL,
			clientId: CLIENT_ID
		});
		const results = await subscriptionToPromise(1)(authorization.subscribe);
		expect(results).toEqual([
			{
				error: expect.objectContaining({
					type: 'unauthorized'
				})
			}
		]);
	});

	it('passes a successful authorization and a successful refresh to the subscription', async () => {
		MockKeycloak.setAuthResults(true, true);
		authorization = authorizeWithKeycloak({
			accessTokenExpirationSecs: ACCESS_TOKEN_EXP,
			realm: REALM,
			authServerUrl: AUTH_SERVER_URL,
			clientId: CLIENT_ID
		});
		const promise = subscriptionToPromise(2)(authorization.subscribe);
		jest.advanceTimersByTime((ACCESS_TOKEN_EXP + 10) * 1000);
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

	it('passes a successful authorization and an unauthorized refresh to the subscription', async () => {
		MockKeycloak.setAuthResults(true, false);
		authorization = authorizeWithKeycloak({
			accessTokenExpirationSecs: ACCESS_TOKEN_EXP,
			realm: REALM,
			authServerUrl: AUTH_SERVER_URL,
			clientId: CLIENT_ID
		});
		const promise = subscriptionToPromise(2)(authorization.subscribe);
		jest.advanceTimersByTime((ACCESS_TOKEN_EXP + 10) * 1000);
		const results = await promise;
		expect(results).toEqual([
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
	});

	it('passes a successful authorization and an access denied refresh to the subscription', async () => {
		throw new Error();
	});

	it('passes a successful authorization to the subscription, then unsubscribes from authorization updates', () => {
		throw new Error();
	});

	it('passes a successful authorization to the subscription, then unsubscribes AND cancels refresh at the same time', () => {
		throw new Error();
	});

	it('passes a successful authorization to the subscription, then cancels refresh and all subscriptions from authorization', () => {
		throw new Error();
	});

	it('passes a successful authorization with the required realm roles to the subscription', async () => {
		MockKeycloak.setAuthResults(true);
		authorization = authorizeWithKeycloak({
			accessTokenExpirationSecs: ACCESS_TOKEN_EXP,
			realm: REALM,
			authServerUrl: AUTH_SERVER_URL,
			clientId: CLIENT_ID,
			requiredRoles: {
				realm: [REALM_ACCESS_ROLE]
			}
		});
		const results = await subscriptionToPromise(1)(authorization.subscribe);
		expect(results).toEqual([
			{
				token: TOKEN,
				tokenParsed: TOKEN_PARSED
			}
		]);
	});

	it('passes a successful authorization with the required client roles to the subscription', async () => {
		MockKeycloak.setAuthResults(true);
		authorization = authorizeWithKeycloak({
			accessTokenExpirationSecs: ACCESS_TOKEN_EXP,
			realm: REALM,
			authServerUrl: AUTH_SERVER_URL,
			clientId: CLIENT_ID,
			requiredRoles: {
				client: [CLIENT_ACCESS_ROLE]
			}
		});
		const results = await subscriptionToPromise(1)(authorization.subscribe);
		expect(results).toEqual([
			{
				token: TOKEN,
				tokenParsed: TOKEN_PARSED
			}
		]);
	});

	it('passes an access denied error due to missing required realm role to the subscription', async () => {
		MockKeycloak.setAuthResults(true);
		authorization = authorizeWithKeycloak({
			accessTokenExpirationSecs: ACCESS_TOKEN_EXP,
			realm: REALM,
			authServerUrl: AUTH_SERVER_URL,
			clientId: CLIENT_ID,
			requiredRoles: {
				realm: ['abc']
			}
		});
		const results = await subscriptionToPromise(1)(authorization.subscribe);
		expect(results).toEqual([
			{
				error: expect.objectContaining({
					type: 'access-denied'
				})
			}
		]);
	});

	it('passes an access denied error due to missing required client role to the subscription', async () => {
		MockKeycloak.setAuthResults(true);
		authorization = authorizeWithKeycloak({
			accessTokenExpirationSecs: ACCESS_TOKEN_EXP,
			realm: REALM,
			authServerUrl: AUTH_SERVER_URL,
			clientId: CLIENT_ID,
			requiredRoles: {
				client: ['abc']
			}
		});
		const results = await subscriptionToPromise(1)(authorization.subscribe);
		expect(results).toEqual([
			{
				error: expect.objectContaining({
					type: 'access-denied'
				})
			}
		]);
	});
});
