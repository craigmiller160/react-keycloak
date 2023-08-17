import { createContext } from 'react';
import type { InternalKeycloakOverrides } from '@craigmiller160/keycloak-js';

export const KeycloakAuthInternalContext = createContext<
	Partial<InternalKeycloakOverrides>
>({});
