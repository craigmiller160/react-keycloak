import { describe, it, expect } from 'vitest';
import {
	isPostAuthorization,
	isPreAuthorization
} from '../../src/react/status';

describe('status', () => {
	it('isPreAuthorization', () => {
		expect(isPreAuthorization('pre-auth')).toEqual(true);
		expect(isPreAuthorization('authorizing')).toEqual(true);
		expect(isPreAuthorization('authorized')).toEqual(false);
		expect(isPreAuthorization('unauthorized')).toEqual(false);
	});

	it('isPostAuthorization', () => {
		expect(isPostAuthorization('pre-auth')).toEqual(false);
		expect(isPostAuthorization('authorizing')).toEqual(false);
		expect(isPostAuthorization('authorized')).toEqual(true);
		expect(isPostAuthorization('unauthorized')).toEqual(true);
	});
});
