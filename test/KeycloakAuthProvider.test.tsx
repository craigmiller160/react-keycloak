import { describe, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import { KeycloakAuthProvider } from '../src';
import { MockKeycloak } from './mocks/MockKeycloak';

vi.mock('keycloak-js', () => {
	return {
		default: MockKeycloak
	};
});

const CLIENT_ID = 'test-client';
const AUTH_SERVER_URL = 'https://auth-server.com';
const ACCESS_TOKEN_EXP = 300;
const REALM = 'realm';
const LOCAL_STORAGE_KEY = 'local-storage-key';

const doRender = () =>
	render(
		<KeycloakAuthProvider
			accessTokenExpirationSecs={ACCESS_TOKEN_EXP}
			realm={REALM}
			authServerUrl={AUTH_SERVER_URL}
			clientId={CLIENT_ID}
			bearerTokenLocalStorageKey={LOCAL_STORAGE_KEY}
		>
			<h1>Hello World</h1>
		</KeycloakAuthProvider>
	);

describe('KeycloakAuthProvider', () => {
	it('initializes authentication on render', () => {
		throw new Error();
	});

	it('handles a successful authentication', () => {
		throw new Error();
	});

	it('handles a failed authentication', () => {
		throw new Error();
	});

	it('handles a successful authentication with the required roles', () => {
		throw new Error();
	});

	it('handles a successful authentication without the required roles', () => {
		throw new Error();
	});
});
