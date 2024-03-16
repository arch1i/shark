import { describe, expect, test } from 'vitest';
import { createEvent, createStore } from '../src/core';

describe('scheduling', () => {
	interface Session {
		isVerified: boolean;
		id: number;
	}

	test('run all mutations after handler executed', () => {
		const $ = createStore<{ session?: Session }>({ session: undefined });
		const session_defined = createEvent<Session>();

		$.on(session_defined, (store, event) => {
			const start = store.session?.id;
			store.session = event.payload;
			const end = store.session?.id;

			expect(start).toEqual(end);
		});

		session_defined({ id: 12, isVerified: false });
		expect($.get().session?.id).toEqual(12);
	});

	test('should emit one CHANGED event', async () => {
		const $ = createStore<{ session?: Session }>({ session: undefined });

		const session_defined = createEvent<Session>();
		const try_certificate = createEvent();

		$.on(session_defined, (store, event) => {
			store.session = event.payload; // set session

			try_certificate();

			if (store.session.isVerified) {
				// do smth
			}
		});

		$.on(try_certificate, (store) => {
			if (store.session) {
				store.session.isVerified = true;
			}
		});

		session_defined({ id: 12, isVerified: false });
	});
});