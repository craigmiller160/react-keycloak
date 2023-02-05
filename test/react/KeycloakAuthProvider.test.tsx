import { beforeEach, describe, expect, it, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import {
	KeycloakAuthContext,
	KeycloakAuthProvider,
	RequiredRoles
} from '../../src';
import { MockKeycloak } from '../mocks/MockKeycloak';
import { useContext } from 'react';
import {
	MOCK_AUTH_SERVER_URL,
	CLIENT_ID,
	REALM,
	TOKEN_PARSED,
	LOCAL_STORAGE_KEY,
	TOKEN
} from '../testutils/data';

const KeycloakRenderer = () => {
	const { status, token, tokenParsed, error } =
		useContext(KeycloakAuthContext);
	return (
		<div>
			<p>Auth Status: {status}</p>
			<p>Token: {`${token !== undefined}`}</p>
			<p>Token Parsed: {`${tokenParsed !== undefined}`}</p>
			<p>Error: {`${error !== undefined}`}</p>
		</div>
	);
};

type RenderConfig = {
	readonly requiredRoles?: Partial<RequiredRoles>;
	readonly localStorageKey?: string;
};

const doRender = (config?: RenderConfig) =>
	render(
		<KeycloakAuthProvider
			realm={REALM}
			authServerUrl={MOCK_AUTH_SERVER_URL}
			clientId={CLIENT_ID}
			requiredRoles={config?.requiredRoles}
			localStorageKey={config?.localStorageKey}
		>
			<KeycloakRenderer />
		</KeycloakAuthProvider>
	);

describe('KeycloakAuthProvider', () => {
	beforeEach(() => {
		localStorage.clear();
	});

	afterEach(() => {
		localStorage.clear();
	});

	it('handles a successful authentication', async () => {
		MockKeycloak.setAuthResults(TOKEN_PARSED);
		doRender();
		await waitFor(() =>
			expect(MockKeycloak.lastConfig).not.toBeUndefined()
		);
		expect(MockKeycloak.lastConfig).toEqual({
			url: MOCK_AUTH_SERVER_URL,
			realm: REALM,
			clientId: CLIENT_ID
		});
		expect(screen.getByText(/Auth Status/)).toHaveTextContent('authorized');
		expect(screen.getByText(/Token:/)).toHaveTextContent('true');
		expect(screen.getByText(/Token Parsed/)).toHaveTextContent('true');
		expect(screen.getByText(/Error/)).toHaveTextContent('false');

		expect(localStorage.getItem(LOCAL_STORAGE_KEY)).toBeNull();
	});

	it('handles a successful authentication with token going to localStorage', async () => {
		MockKeycloak.setAuthResults(TOKEN_PARSED);
		doRender({
			localStorageKey: LOCAL_STORAGE_KEY
		});
		await waitFor(() =>
			expect(MockKeycloak.lastConfig).not.toBeUndefined()
		);
		expect(MockKeycloak.lastConfig).toEqual({
			url: MOCK_AUTH_SERVER_URL,
			realm: REALM,
			clientId: CLIENT_ID
		});
		expect(screen.getByText(/Auth Status/)).toHaveTextContent('authorized');
		expect(screen.getByText(/Token:/)).toHaveTextContent('true');
		expect(screen.getByText(/Token Parsed/)).toHaveTextContent('true');
		expect(screen.getByText(/Error/)).toHaveTextContent('false');

		expect(localStorage.getItem(LOCAL_STORAGE_KEY)).toEqual(TOKEN);
	});

	it('handles a successful authentication with required roles', async () => {
		throw new Error();
	});

	it('handles a failed authentication due to required roles', async () => {
		throw new Error();
	});

	it('handles a failed authentication', async () => {
		MockKeycloak.setAuthResults(null);
		doRender();
		await waitFor(() =>
			expect(MockKeycloak.lastConfig).not.toBeUndefined()
		);
		expect(MockKeycloak.lastConfig).toEqual({
			url: MOCK_AUTH_SERVER_URL,
			realm: REALM,
			clientId: CLIENT_ID
		});
		await waitFor(() =>
			expect(screen.getByText(/Auth Status/)).toHaveTextContent(
				'unauthorized'
			)
		);
		expect(screen.getByText(/Token:/)).toHaveTextContent('false');
		expect(screen.getByText(/Token Parsed/)).toHaveTextContent('false');
		expect(screen.getByText(/Error/)).toHaveTextContent('true');
	});
});
