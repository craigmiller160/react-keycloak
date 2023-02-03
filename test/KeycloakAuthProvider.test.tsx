import { describe, it, vi, expect, beforeEach } from 'vitest';
import { render, waitFor, screen } from '@testing-library/react';
import { KeycloakAuthContext, KeycloakAuthProvider } from '../src';
import { DEFAULT_TOKEN, MockKeycloak } from './mocks/MockKeycloak';
import { useContext } from 'react';
import { KeycloakTokenParsed } from 'keycloak-js';
import { RequiredRoles } from '../src/KeycloakAuthProvider';

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
const REALM_ACCESS_ROLE = 'realm-access';
const CLIENT_ACCESS_ROLE = 'client-access';

const tokenParsed: KeycloakTokenParsed = {
	sub: 'mock-token',
	realm_access: {
		roles: [REALM_ACCESS_ROLE]
	},
	resource_access: {
		[CLIENT_ID]: {
			roles: [CLIENT_ACCESS_ROLE]
		}
	}
};

const KeycloakRenderer = () => {
	const { isAuthorized, authStatus } = useContext(KeycloakAuthContext);
	return (
		<div>
			<p>Is Authorized: {isAuthorized ? 'true' : 'false'}</p>
			<p>Auth Status: {authStatus}</p>
		</div>
	);
};

const doRender = (requiredRoles?: Partial<RequiredRoles>) =>
	render(
		<KeycloakAuthProvider
			accessTokenExpirationSecs={ACCESS_TOKEN_EXP}
			realm={REALM}
			authServerUrl={AUTH_SERVER_URL}
			clientId={CLIENT_ID}
			bearerTokenLocalStorageKey={LOCAL_STORAGE_KEY}
			requiredRoles={requiredRoles}
		>
			<KeycloakRenderer />
		</KeycloakAuthProvider>
	);

describe('KeycloakAuthProvider', () => {
	beforeEach(() => {
		MockKeycloak.reset();
		localStorage.clear();
	});

	it('handles a successful authentication', async () => {
		MockKeycloak.setAuthResult(true, tokenParsed);
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

	it('handles a failed authentication', async () => {
		MockKeycloak.setAuthResult(false);
		doRender();
		await waitFor(() =>
			expect(MockKeycloak.lastConfig).not.toBeUndefined()
		);
		expect(MockKeycloak.lastConfig).toEqual({
			url: AUTH_SERVER_URL,
			realm: REALM,
			clientId: CLIENT_ID
		});
		expect(localStorage.getItem(LOCAL_STORAGE_KEY)).toBeNull();
		await waitFor(() =>
			expect(screen.getByText(/Is Authorized/)).toHaveTextContent('false')
		);
		await waitFor(() =>
			expect(screen.getByText(/Auth Status/)).toHaveTextContent(
				'post-auth'
			)
		);
	});

	it('handles a successful authentication with the required realm roles', async () => {
		MockKeycloak.setAuthResult(true, tokenParsed);
		doRender({
			realm: [REALM_ACCESS_ROLE]
		});
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

	it('handles a successful authentication with the required client roles', async () => {
		MockKeycloak.setAuthResult(true, tokenParsed);
		doRender({
			client: {
				[CLIENT_ID]: [CLIENT_ACCESS_ROLE]
			}
		});
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

	it('handles a successful authentication without the roles required roles', async () => {
		MockKeycloak.setAuthResult(true, tokenParsed);
		doRender({
			realm: ['not_there']
		});
		await waitFor(() =>
			expect(MockKeycloak.lastConfig).not.toBeUndefined()
		);
		expect(MockKeycloak.lastConfig).toEqual({
			url: AUTH_SERVER_URL,
			realm: REALM,
			clientId: CLIENT_ID
		});
		expect(localStorage.getItem(LOCAL_STORAGE_KEY)).toBeNull();
		await waitFor(() =>
			expect(screen.getByText(/Is Authorized/)).toHaveTextContent('false')
		);
		await waitFor(() =>
			expect(screen.getByText(/Auth Status/)).toHaveTextContent(
				'post-auth'
			)
		);
	});
});
