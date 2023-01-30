import { Dispatch, PropsWithChildren, useEffect, useState } from 'react';
import Keycloak from 'keycloak-js';
import { KeycloakAuth, KeycloakAuthContext } from './KeycloakAuthContext';

type Props = {
	readonly accessTokenExpirationSecs: number;
	readonly realm: string;
	readonly authServerUrl: string;
	readonly clientId: string;
	readonly bearerTokenLocalStorageKey: string;
};

type KeycloakState = Omit<KeycloakAuth, 'logout'> & {
	readonly keycloak: Keycloak;
};

const createKeycloak = (props: Props): Keycloak =>
	new Keycloak({
		url: props.authServerUrl,
		realm: props.realm,
		clientId: props.clientId
	});

const handleKeycloakResult =
	(
		keycloak: Keycloak,
		bearerTokenLocalStorageKey: string,
		updateAuth: Dispatch<KeycloakState>
	) =>
	(isSuccess: boolean) => {
		if (isSuccess && keycloak.token) {
			localStorage.setItem(bearerTokenLocalStorageKey, keycloak.token);
		}
		updateAuth((prevState) => ({
			...prevState,
			checkStatus: 'post-check',
			isAuthorized: isSuccess
		}));
	};

const initializeKeycloak = (
	keycloak: Keycloak,
	accessTokenExpirationSecs: number,
	bearerTokenLocalStorageKey: string,
	updateAuth: Dispatch<KeycloakState>
): Promise<void> => {
	const promise = keycloak
		.init({ onLoad: 'login-required' })
		.then(
			handleKeycloakResult(
				keycloak,
				bearerTokenLocalStorageKey,
				updateAuth
			)
		)
		.catch((ex) => console.error('Keycloak Authentication Error', ex));

	setInterval(() => {
		keycloak
			.updateToken(accessTokenExpirationSecs - 70)
			.then(handleKeycloakResult(updateAuth))
			.catch((ex) => console.error('Keycloak Refresh Error', ex));
	}, (accessTokenExpirationSecs - 60) * 1000);

	return promise;
};

export const KeycloakAuthProvider = (props: PropsWithChildren<Props>) => {
	const [state, setState] = useState<KeycloakState>({
		isAuthorized: false,
		checkStatus: 'pre-check',
		keycloak: createKeycloak(props)
	});
	useEffect(() => {
		if (state.checkStatus === 'pre-check') {
			setState((prevState) => ({
				...prevState,
				checkStatus: 'checking'
			}));
		} else if (state.checkStatus === 'checking') {
			initializeKeycloak(
				state.keycloak,
				props.accessTokenExpirationSecs,
				props.bearerTokenLocalStorageKey,
				setState
			);
		}
	}, [
		setState,
		state.checkStatus,
		props.accessTokenExpirationSecs,
		props.bearerTokenLocalStorageKey,
		state.keycloak
	]);

	const authValue: KeycloakAuth = {
		logout: state.keycloak.logout,
		checkStatus: state.checkStatus,
		isAuthorized: state.isAuthorized
	};

	return (
		<KeycloakAuthContext.Provider value={authValue}>
			{props.children}
		</KeycloakAuthContext.Provider>
	);
};
