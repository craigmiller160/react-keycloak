import { describe, it, vi } from 'vitest';

vi.mock('keycloak-js', async () => {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const mock = (await vi.importActual('./mocks/MockKeycloak')) as any;
	return {
		default: mock.MockKeycloak
	};
});

describe('AuthorizeWithKeycloak', () => {
	it('handles a successful authentication', async () => {
		throw new Error();
	});

	it('handles a failed authentication', async () => {
		throw new Error();
	});

	it('handles a successful authentication with the required realm roles', async () => {
		throw new Error();
	});

	it('handles a successful authentication with the required client roles', async () => {
		throw new Error();
	});

	it('handles a successful authentication without the roles required roles', async () => {
		throw new Error();
	});
});
