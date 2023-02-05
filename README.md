# React Keycloak

This is just a utility for integrating keycloak into React applications for the craigmiller160 environment.

## How to Use

Import and add the provider at the root of the component tree. It will trigger the full authentication flow with keycloak. A successful authorization is one where keycloak provides an access token AND the token contains any of the `requiredRoles` that can be specified via a prop.

```typescript jsx
import { KeycloakAuthProvider } from '@craigmiller160/react-keycloak';

const App = () => (
    <KeycloakAuthProvider
        realm={REALM}
        clientId={CLIENT_ID}
        requiredRoles={REQUIRED_ROLES} // Optional
        authServerUrl={AUTH_SERVER_URL} // Optional override, defaults to deployed auth server
    >
        <div />
    </KeycloakAuthProvider>
);
```

In a child component, the context can be accessed to get all the data.

```typescript jsx
import { useContext } from 'react';
import { KeycloakAuthContext } from '@craigmiller160/react-keycloak';

const Child = () => {
    const { status, token, tokenParsed, error } = useContext(KeycloakAuthContext);
    
    return (
        <div />
    );
};
```

The `status` indicates at what state of the process the authorization is currently at. Values can be `pre-auth`, `authorizing`, `authorized`, and `unauthorized`. When `authorized`, the `token` and `tokenParsed` values will be available. When `unauthorized`, the error value will be available.
