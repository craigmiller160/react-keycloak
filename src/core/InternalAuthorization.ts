import {
	KeycloakAuthFailedHandler,
	KeycloakAuthorization,
	KeycloakAuthSubscription,
	KeycloakAuthSuccessHandler
} from './types';
import Keycloak, { KeycloakTokenParsed } from 'keycloak-js';
import { nanoid } from 'nanoid';
import { AuthorizationStoppedError } from '../errors/AuthorizationStoppedError';
import { UnauthorizedError } from '../errors/UnauthorizedError';
import { AccessDeniedError } from '../errors/AccessDeniedError';

export class InternalAuthorization implements KeycloakAuthorization {
	isStopped = false;
	private token?: string;
	private tokenParsed?: KeycloakTokenParsed;

	private readonly subscriptions: KeycloakAuthSubscription[] = [];
	readonly keycloak: Keycloak;
	constructor(keycloak: Keycloak) {
		this.keycloak = keycloak;
	}
	stop() {
		this.subscriptions.splice(0, this.subscriptions.length);
		this.isStopped = true;
	}
	subscribe(
		onSuccess: KeycloakAuthSuccessHandler,
		onFailure: KeycloakAuthFailedHandler
	) {
		const id = nanoid();
		if (this.isStopped) {
			onFailure(new AuthorizationStoppedError());
			return {
				onSuccess,
				onFailure,
				unsubscribe: () => null,
				id
			};
		}

		const unsubscribe = (stopAuthorization?: boolean) => {
			const index = this.subscriptions.findIndex((sub) => sub.id === id);
			if (index >= 0) {
				this.subscriptions.splice(index, 1);
			}

			if (stopAuthorization) {
				this.stop();
			}
		};
		const subscription: KeycloakAuthSubscription = {
			onSuccess,
			onFailure,
			id,
			unsubscribe
		};
		this.subscriptions.push(subscription);
		return subscription;
	}

	logout() {
		this.keycloak.logout();
	}

	emitAuthorized() {
		this.subscriptions.forEach((subscription) =>
			subscription.onSuccess(
				this.keycloak.token!,
				this.keycloak.tokenParsed!
			)
		);
	}

	emitUnauthorized() {
		this.subscriptions.forEach((subscription) =>
			subscription.onFailure(new UnauthorizedError())
		);
	}

	emitAccessDenied() {
		this.subscriptions.forEach((subscription) =>
			subscription.onFailure(new AccessDeniedError())
		);
	}
}
