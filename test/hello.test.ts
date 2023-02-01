import { describe, it, expect } from 'vitest';

describe('Hello World test', () => {
	it('say hello world', () => {
		const message = 'Hello World';
		expect(message).toEqual('Hello World');
	});
});
