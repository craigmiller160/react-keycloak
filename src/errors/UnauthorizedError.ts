export class UnauthorizedError extends Error {
	readonly name = 'UnauthorizedError';
	constructor() {
		super('User is unauthorized');
	}
}
