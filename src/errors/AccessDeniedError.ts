export class AccessDeniedError extends Error {
	readonly name = 'AccessDeniedError';

	constructor() {
		super('User does not have access to application');
	}
}
