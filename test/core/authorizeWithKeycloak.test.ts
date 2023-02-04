import { describe, it } from 'vitest';

describe('authorizeWithKeycloak', () => {
	it('passes a successful authorization to the subscription', () => {
		throw new Error();
	});

	it('passes an unauthorized error to the subscription', () => {
		throw new Error();
	});

	it('passes a successful authorization and a successful refresh to the subscription', () => {
		throw new Error();
	});

	it('passes a successful authorization and a failed refresh to the subscription', () => {
		throw new Error();
	});

	it('unsubscribes from authorization updates', () => {
		throw new Error();
	});

	it('unsubscribes AND cancels refresh at the same time', () => {
		throw new Error();
	});

	it('cancels refresh from authorization', () => {
		throw new Error();
	});

	it('passes a successful authorization with the required realm roles to the subscription', () => {
		throw new Error();
	});

	it('passes a successful authorization with the required client roles to the subscription', () => {
		throw new Error();
	});

	it('passes an access denied error due to missing required realm role to the subscription', () => {
		throw new Error();
	});

	it('passes an access denied error due to missing required client role to the subscription', () => {
		throw new Error();
	});
});
