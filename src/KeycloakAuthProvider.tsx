import { PropsWithChildren, useEffect } from 'react';
import Keycloak from 'keycloak-js';
import { KeycloakAuth, KeycloakAuthContext } from './KeycloakAuthContext';

type Props = {
	readonly accessTokenExpirationSecs: number;
	readonly realm: string;
	readonly authServerUrl: string;
	readonly clientId: string;
	readonly bearerTokenLocalStorageKey: string;
}

type KeycloakState = Omit<KeycloakAuth, 'logout'>;

const getRealm = (): string => {
	if (process.env.NODE_ENV !== 'test') {
		return import.meta.env.VITE_KEYCLOAK_REALM;
	}
	return '';
};

const keycloak = new Keycloak({
	url: 'https://auth-craigmiller160.ddns.net/',
	realm: getRealm(),
	clientId: 'expense-tracker-ui'
});
const logout = () => keycloak.logout();

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

export const KeycloakAuthProvider = (props: PropsWithChildren) => {
	const [state, setState] = useImmer<KeycloakState>({
		isAuthorized: false,
		checkStatus: 'pre-check'
	});
	useEffect(() => {
		if (state.checkStatus === 'pre-check') {
			setState((draft) => {
				draft.checkStatus = 'checking';
			});
		} else if (state.checkStatus === 'checking') {
			initializeKeycloak(setState);
		}
	}, [setState, state.checkStatus]);

	const authValue = {
		...state,
		logout
	};

	return (
		<KeycloakAuthContext.Provider value={authValue}>
			{props.children}
		</KeycloakAuthContext.Provider>
	);
};
