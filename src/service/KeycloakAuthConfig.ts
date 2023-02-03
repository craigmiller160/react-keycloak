export type RequiredRoles = {
	readonly realm: ReadonlyArray<string>;
	readonly client: Record<string, ReadonlyArray<string>>;
};

export type KeycloakAuthConfig = {
	readonly accessTokenExpirationSecs: number;
	readonly realm: string;
	readonly authServerUrl: string;
	readonly clientId: string;
	readonly requiredRoles?: Partial<RequiredRoles>;
};
