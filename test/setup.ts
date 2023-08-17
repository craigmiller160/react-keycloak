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

vi.mock('../src/utils/navigate', () => ({
	navigate: vi.fn()
}));

vi.mock('keycloak-js', async () => {
	const mock = await vi.importActual<{ MockKeycloak: MockKeycloak }>(
		'./mocks/MockKeycloak'
	);
	return {
		default: mock.MockKeycloak
	};
});
