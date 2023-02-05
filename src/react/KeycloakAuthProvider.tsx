import { PropsWithChildren, useEffect, useState } from 'react';
import { KeycloakAuth, KeycloakAuthContext } from './KeycloakAuthContext';
import { AuthorizeWithKeycloak, RequiredRoles } from '../core/types';
import { createKeycloakAuthorization } from '../core';

type Props = {
	readonly realm: string;
	readonly authServerUrl: string;
	readonly clientId: string;
	readonly requiredRoles?: Partial<RequiredRoles>;
};

type State = KeycloakAuth & {
	readonly authorize: AuthorizeWithKeycloak;
};

export const KeycloakAuthProvider = (props: PropsWithChildren<Props>) => {
	const [state, setState] = useState<State>({
		status: 'pre-auth',
		// eslint-disable-next-line @typescript-eslint/no-empty-function
		logout: () => {},
		// eslint-disable-next-line @typescript-eslint/no-empty-function
		authorize: () => {}
	});

	useEffect(() => {
		if (state.status === 'pre-auth') {
			const [authorize, logout] = createKeycloakAuthorization({
				realm: props.realm,
				clientId: props.clientId,
				authServerUrl: props.authServerUrl,
				requiredRoles: props.requiredRoles
			});
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
	}, [
		state,
		props.realm,
		props.clientId,
		props.authServerUrl,
		props.requiredRoles
	]);

	return (
		<KeycloakAuthContext.Provider value={state}>
			{props.children}
		</KeycloakAuthContext.Provider>
	);
};
