import { PropsWithChildren, useEffect, useState } from 'react';
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
	(updateAuth: Updater<KeycloakState>) => (isSuccess: boolean) => {
		if (isSuccess && keycloak.token) {
			localStorage.setItem(BEARER_TOKEN_KEY, keycloak.token);
		}
		updateAuth((draft) => {
			draft.checkStatus = 'post-check';
			draft.isAuthorized = isSuccess;
		});
	};

const initializeKeycloak = (
	updateAuth: Updater<KeycloakState>
): Promise<void> => {
	const promise = keycloak
		.init({ onLoad: 'login-required' })
		.then(handleKeycloakResult(updateAuth))
		.catch((ex) => console.error('Keycloak Authentication Error', ex));

	setInterval(() => {
		keycloak
			.updateToken(ACCESS_TOKEN_EXP_SECS - 70)
			.then(handleKeycloakResult(updateAuth))
			.catch((ex) => console.error('Keycloak Refresh Error', ex));
	}, (ACCESS_TOKEN_EXP_SECS - 60) * 1000);

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
			initializeKeycloak(setState);
		}
	}, [setState, state.checkStatus]);

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
