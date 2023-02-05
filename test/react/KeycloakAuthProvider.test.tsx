import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import {
	KeycloakAuthContext,
	KeycloakAuthProvider,
	RequiredRoles
} from '../../src';
import { MockKeycloak } from '../mocks/MockKeycloak';
import { useContext } from 'react';
import {
	AUTH_SERVER_URL,
	CLIENT_ID,
	LOCAL_STORAGE_KEY,
	REALM,
	TOKEN,
	TOKEN_PARSED
} from '../testutils/data';

const KeycloakRenderer = () => {
	const { status } = useContext(KeycloakAuthContext);
	return (
		<div>
			<p>Auth Status: {status}</p>
		</div>
	);
};

const doRender = (requiredRoles?: Partial<RequiredRoles>) =>
	render(
		<KeycloakAuthProvider
			realm={REALM}
			authServerUrl={AUTH_SERVER_URL}
			clientId={CLIENT_ID}
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
		MockKeycloak.setAuthResults(TOKEN_PARSED);
		doRender();
		await waitFor(() =>
			expect(MockKeycloak.lastConfig).not.toBeUndefined()
		);
		expect(MockKeycloak.lastConfig).toEqual({
			url: AUTH_SERVER_URL,
			realm: REALM,
			clientId: CLIENT_ID
		});
		expect(localStorage.getItem(LOCAL_STORAGE_KEY)).toEqual(TOKEN);
		await waitFor(() =>
			expect(screen.getByText(/Is Authorized/)).toHaveTextContent('true')
		);
		expect(screen.getByText(/Auth Status/)).toHaveTextContent('post-auth');
	});

	it('handles a failed authentication', async () => {
		MockKeycloak.setAuthResults(null);
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
});
