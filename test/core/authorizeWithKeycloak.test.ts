import { describe, it } from 'vitest';
import { KeycloakAuthorization } from '../../src/core/types';
import { MockKeycloak } from '../mocks/MockKeycloak';
import { authorizeWithKeycloak } from '../../src/core/authorizeWithKeycloak';
import {
	ACCESS_TOKEN_EXP,
	AUTH_SERVER_URL,
	CLIENT_ID,
	REALM
} from '../testutils/data';

describe('authorizeWithKeycloak', () => {
	let authorization: KeycloakAuthorization | undefined = undefined;
	afterEach(() => {
		if (authorization) {
			authorization.stopRefreshAndSubscriptions();
		}
	});

	it('passes a successful authorization to the subscription', () => {
		MockKeycloak.setAuthResult(true);
		authorization = authorizeWithKeycloak({
			accessTokenExpirationSecs: ACCESS_TOKEN_EXP,
			realm: REALM,
			authServerUrl: AUTH_SERVER_URL,
			clientId: CLIENT_ID
		});
		throw new Error();
	});

	it('passes an unauthorized error to the subscription', () => {
		throw new Error();
	});

	it('passes a successful authorization and a successful refresh to the subscription', () => {
		throw new Error();
	});

	it('passes a successful authorization and a failed refresh to the subscription', () => {
		throw new Error();
	});

	it('unsubscribes from authorization updates', () => {
		throw new Error();
	});

	it('unsubscribes AND cancels refresh at the same time', () => {
		throw new Error();
	});

	it('cancels refresh and all subscriptions from authorization', () => {
		throw new Error();
	});

	it('passes a successful authorization with the required realm roles to the subscription', () => {
		throw new Error();
	});

	it('passes a successful authorization with the required client roles to the subscription', () => {
		throw new Error();
	});

	it('passes an access denied error due to missing required realm role to the subscription', () => {
		throw new Error();
	});

	it('passes an access denied error due to missing required client role to the subscription', () => {
		throw new Error();
	});
});
