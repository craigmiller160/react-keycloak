import { PropsWithChildren, useEffect, useState } from 'react';
import { KeycloakAuthContext } from './KeycloakAuthContext';
import type { KeycloakAuth } from './types';
import { AuthorizeWithKeycloak, KeycloakAuthConfig } from '../core/types';
import { createKeycloakAuthorization } from '../core';

type ProviderState = KeycloakAuth & {
	readonly authorize: AuthorizeWithKeycloak;
};

export const KeycloakAuthProvider = (
	props: PropsWithChildren<KeycloakAuthConfig>
) => {
	const [state, setState] = useState<ProviderState>({
		status: 'pre-auth',
		// eslint-disable-next-line @typescript-eslint/no-empty-function
		logout: () => {},
		// eslint-disable-next-line @typescript-eslint/no-empty-function
		authorize: () => {}
	});

	useEffect(() => {
		if (state.status === 'pre-auth') {
			const [authorize, logout] = createKeycloakAuthorization(props);
			setState((prevState) => ({
				...prevState,
				status: 'authorizing',
				authorize,
				logout
			}));
		} else if (state.status === 'authorizing') {
			state.authorize(
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
	}, [state, props]);

	return (
		<KeycloakAuthContext.Provider value={state}>
			{props.children}
		</KeycloakAuthContext.Provider>
	);
};
