import { describe, it, expect } from 'vitest';

describe('Hello World test', () => {
	it('say hello world', () => {
		const message = 'Hello world';
		expect(message).toEqual('Hello World');
	});
});
