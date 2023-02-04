import { describe, it, expect, beforeEach } from 'vitest';
import { render, waitFor, screen } from '@testing-library/react';
import { KeycloakAuthContext, KeycloakAuthProvider } from '../../src';
import { DEFAULT_TOKEN, MockKeycloak } from '../mocks/MockKeycloak';
import { useContext } from 'react';
import { RequiredRoles } from '../../src/react/KeycloakAuthProvider';
import {
	ACCESS_TOKEN_EXP,
	AUTH_SERVER_URL,
	CLIENT_ACCESS_ROLE,
	CLIENT_ID,
	LOCAL_STORAGE_KEY,
	REALM,
	REALM_ACCESS_ROLE,
	TOKEN_PARSED
} from '../testutils/data';

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
		localStorage.clear();
	});

	it('handles a successful authentication', async () => {
		MockKeycloak.setAuthResults(true, TOKEN_PARSED);
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
		MockKeycloak.setAuthResults(false);
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
		MockKeycloak.setAuthResults(true, TOKEN_PARSED);
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
		MockKeycloak.setAuthResults(true, TOKEN_PARSED);
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
		MockKeycloak.setAuthResults(true, TOKEN_PARSED);
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
