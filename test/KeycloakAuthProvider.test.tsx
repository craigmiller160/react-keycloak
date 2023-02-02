import { describe, it, vi, expect, beforeEach } from 'vitest';
import { render, waitFor, screen } from '@testing-library/react';
import { KeycloakAuthContext, KeycloakAuthProvider } from '../src';
import { DEFAULT_TOKEN, MockKeycloak } from './mocks/MockKeycloak';
import { useContext } from 'react';

vi.mock('keycloak-js', async () => {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const mock = (await vi.importActual('./mocks/MockKeycloak')) as any;
	return {
		default: mock.MockKeycloak
	};
});

const CLIENT_ID = 'test-client';
const AUTH_SERVER_URL = 'https://auth-server.com';
const ACCESS_TOKEN_EXP = 3000000;
const REALM = 'realm';
const LOCAL_STORAGE_KEY = 'local-storage-key';

const KeycloakRenderer = () => {
	const { isAuthorized, authStatus } = useContext(KeycloakAuthContext);
	return (
		<div>
			<p>Is Authorized: {isAuthorized ? 'true' : 'false'}</p>
			<p>Auth Status: {authStatus}</p>
		</div>
	);
};

const doRender = () =>
	render(
		<KeycloakAuthProvider
			accessTokenExpirationSecs={ACCESS_TOKEN_EXP}
			realm={REALM}
			authServerUrl={AUTH_SERVER_URL}
			clientId={CLIENT_ID}
			bearerTokenLocalStorageKey={LOCAL_STORAGE_KEY}
		>
			<KeycloakRenderer />
		</KeycloakAuthProvider>
	);

describe('KeycloakAuthProvider', () => {
	beforeEach(() => {
		MockKeycloak.reset();
	});

	it('handles a successful authentication', async () => {
		doRender();
		await waitFor(() =>
			expect(MockKeycloak.lastConfig).not.toBeUndefined()
		);
		expect(MockKeycloak.lastConfig).toEqual({
			url: AUTH_SERVER_URL,
			realm: REALM,
			clientId: CLIENT_ID
		});
		expect(localStorage.getItem(LOCAL_STORAGE_KEY)).toEqual(DEFAULT_TOKEN);
		await waitFor(() =>
			expect(screen.getByText(/Is Authorized/)).toHaveTextContent('true')
		);
		expect(screen.getByText(/Auth Status/)).toHaveTextContent('post-auth');
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
