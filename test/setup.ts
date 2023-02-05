import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import matchers from '@testing-library/jest-dom/matchers';
import { MockKeycloak } from './mocks/MockKeycloak';

expect.extend(matchers);

afterEach(() => {
	MockKeycloak.reset();
	cleanup();
});

vi.mock('../src/utils/newDate', () => {
	const date = new Date();
	return {
		newDate: () => date
	};
});

vi.mock('keycloak-js', async () => {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const mock = (await vi.importActual('./mocks/MockKeycloak')) as any;
	return {
		default: mock.MockKeycloak
	};
});
