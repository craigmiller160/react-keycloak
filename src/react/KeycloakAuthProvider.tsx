import { PropsWithChildren, useEffect, useMemo, useState } from 'react';
import { KeycloakAuthContext } from './KeycloakAuthContext';
import type { KeycloakAuth } from './types';
import {
	createKeycloakAuthorization,
	KeycloakAuthConfig
} from '@craigmiller160/keycloak-js';
import { isPostAuthorization, isPreAuthorization } from './status';

type ProviderState = Omit<
	KeycloakAuth,
	'logout' | 'isPreAuthorization' | 'isPostAuthorization'
>;

export const KeycloakAuthProvider = (
	props: PropsWithChildren<KeycloakAuthConfig>
) => {
	const [state, setState] = useState<ProviderState>({
		status: 'pre-auth'
	});

	// Necessary to be able to stringify
	const keycloakConfig: KeycloakAuthConfig & { children: undefined } = {
		...props,
		children: undefined
	};

	const [authorize, logout] = useMemo(
		() => createKeycloakAuthorization(keycloakConfig),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[JSON.stringify(keycloakConfig)]
	);

	useEffect(() => {
		if (state.status === 'pre-auth') {
			setState((prevState) => ({
				...prevState,
				status: 'authorizing'
			}));
		} else if (state.status === 'authorizing') {
			authorize(
				(token, tokenParsed) =>
					setState((prevState) => ({
						...prevState,
						status: 'authorized',
						isAuthorized: true,
						token,
						tokenParsed
					})),
				(error) =>
					setState((prevState) => ({
						...prevState,
						status: 'unauthorized',
						isAuthorized: false,
						token: undefined,
						tokenParsed: undefined,
						error
					}))
			);
		}
	}, [state, authorize]);

	const authValue: KeycloakAuth = {
		...state,
		logout,
		isPreAuthorization: isPreAuthorization(state.status),
		isPostAuthorization: isPostAuthorization(state.status)
	};

	return (
		<KeycloakAuthContext.Provider value={authValue}>
			{props.children}
		</KeycloakAuthContext.Provider>
	);
};
