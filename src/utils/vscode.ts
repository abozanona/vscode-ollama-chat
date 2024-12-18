import { VSCodeAPI } from '../vscode-api';
import { logger } from './logging';

// Export utility functions that use the VSCodeAPI singleton
export function postMessage(message: any): void {
    try {
        VSCodeAPI.getInstance().postMessage(message);
    } catch (error) {
        logger.error('Failed to post message:', error);
        throw error;
    }
}

export function getState<T>(): T {
    try {
        return VSCodeAPI.getInstance().getState();
    } catch (error) {
        logger.error('Failed to get state:', error);
        throw error;
    }
}

export function setState<T>(state: T): void {
    try {
        VSCodeAPI.getInstance().setState(state);
    } catch (error) {
        logger.error('Failed to set state:', error);
        throw error;
    }
}
