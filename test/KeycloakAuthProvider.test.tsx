import { describe, it, vi, expect } from 'vitest';
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
const ACCESS_TOKEN_EXP = 300;
const REALM = 'realm';
const LOCAL_STORAGE_KEY = 'local-storage-key';

const KeycloakRenderer = () => {
	const { token } = useContext(KeycloakAuthContext);
	return (
		<div>
			<p>Token: {token}</p>
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
	it('initializes authentication on render', async () => {
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
		expect(screen.getByText(/Token/)).toHaveTextContent(DEFAULT_TOKEN);
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