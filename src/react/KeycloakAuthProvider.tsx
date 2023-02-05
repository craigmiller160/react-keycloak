import { PropsWithChildren, useEffect, useMemo, useState } from 'react';
import { KeycloakAuthContext } from './KeycloakAuthContext';
import type { KeycloakAuth } from './types';
import { KeycloakAuthConfig } from '../core/types';
import { createKeycloakAuthorization } from '../core';

type ProviderState = Omit<KeycloakAuth, 'logout'>;

export const KeycloakAuthProvider = (
	props: PropsWithChildren<KeycloakAuthConfig>
) => {
	const [state, setState] = useState<ProviderState>({
		status: 'authorizing'
	});

	const [authorize, logout] = useMemo(
		() => createKeycloakAuthorization(props),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[JSON.stringify(props)]
	);

	useEffect(() => {
		if (state.status === 'authorizing') {
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
		logout
	};

	return (
		<KeycloakAuthContext.Provider value={authValue}>
			{props.children}
		</KeycloakAuthContext.Provider>
	);
};
