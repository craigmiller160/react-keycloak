import {
	Dispatch,
	PropsWithChildren,
	SetStateAction,
	useEffect,
	useState
} from 'react';
import Keycloak from 'keycloak-js';
import { KeycloakAuth, KeycloakAuthContext } from './KeycloakAuthContext';

export type RequiredRoles = {
	readonly realm: ReadonlyArray<string>;
	readonly client: Record<string, ReadonlyArray<string>>;
};

type Props = {
	readonly accessTokenExpirationSecs: number;
	readonly realm: string;
	readonly authServerUrl: string;
	readonly clientId: string;
	readonly bearerTokenLocalStorageKey: string;
	readonly requiredRoles?: Partial<RequiredRoles>;
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
		updateAuth: Dispatch<SetStateAction<KeycloakState>>
	) =>
	(isSuccess: boolean) => {
		if (isSuccess && keycloak.token) {
			localStorage.setItem(bearerTokenLocalStorageKey, keycloak.token);
		}
		updateAuth((prevState) => ({
			...prevState,
			authStatus: 'post-auth',
			isAuthorized: isSuccess
		}));
	};

const initializeKeycloak = (
	keycloak: Keycloak,
	accessTokenExpirationSecs: number,
	bearerTokenLocalStorageKey: string,
	updateAuth: Dispatch<SetStateAction<KeycloakState>>
): number => {
	keycloak
		.init({ onLoad: 'login-required' })
		.then(
			handleKeycloakResult(
				keycloak,
				bearerTokenLocalStorageKey,
				updateAuth
			)
		)
		.catch((ex) => console.error('Keycloak Authentication Error', ex));

	const interval = window.setInterval(() => {
		keycloak
			.updateToken(accessTokenExpirationSecs - 70)
			.then(
				handleKeycloakResult(
					keycloak,
					bearerTokenLocalStorageKey,
					updateAuth
				)
			)
			.catch((ex) => console.error('Keycloak Refresh Error', ex));
	}, (accessTokenExpirationSecs - 60) * 1000);

	return interval;
};

export const KeycloakAuthProvider = (props: PropsWithChildren<Props>) => {
	const [state, setState] = useState<KeycloakState>({
		isAuthorized: false,
		authStatus: 'pre-auth',
		keycloak: createKeycloak(props)
	});
	useEffect(() => {
		let interval: number | undefined = undefined;
		if (state.authStatus === 'pre-auth') {
			setState((prevState) => ({
				...prevState,
				authStatus: 'authorizing'
			}));
		} else if (state.authStatus === 'authorizing') {
			interval = initializeKeycloak(
				state.keycloak,
				props.accessTokenExpirationSecs,
				props.bearerTokenLocalStorageKey,
				setState
			);
		}

		return () => {
			if (interval) {
				clearInterval(interval);
			}
		};
	}, [
		setState,
		state.authStatus,
		props.accessTokenExpirationSecs,
		props.bearerTokenLocalStorageKey,
		state.keycloak
	]);

	const authValue: KeycloakAuth = {
		logout: state.keycloak.logout,
		authStatus: state.authStatus,
		isAuthorized: state.isAuthorized,
		token: state.keycloak.tokenParsed
	};

	return (
		<KeycloakAuthContext.Provider value={authValue}>
			{props.children}
		</KeycloakAuthContext.Provider>
	);
};
