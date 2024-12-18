// Type definitions for VS Code's webview API
export interface VSCodeWebviewApi {
    postMessage(message: any): void;
    getState(): any;
    setState(state: any): void;
}

// Global type augmentation - this should be the only place we declare Window interface
declare global {
    interface Window {
        acquireVsCodeApi(): VSCodeWebviewApi;
        __vscodeApi?: VSCodeWebviewApi;
    }
}

// VS Code API singleton
export class VSCodeAPI {
    private static instance: VSCodeAPI;
    private api: VSCodeWebviewApi;

    private constructor() {
        if (typeof window === 'undefined') {
            throw new Error('VS Code API is only available in webview context');
        }

        // Use the globally stored API instance if available
        if (window.__vscodeApi) {
            this.api = window.__vscodeApi;
        } else {
            try {
                // Acquire and store the VS Code API
                this.api = window.acquireVsCodeApi();
                window.__vscodeApi = this.api;
            } catch (error) {
                console.error('Failed to acquire VS Code API:', error);
                throw error;
            }
        }
    }

    public static getInstance(): VSCodeAPI {
        if (!VSCodeAPI.instance) {
            VSCodeAPI.instance = new VSCodeAPI();
        }
        return VSCodeAPI.instance;
    }

    public postMessage(message: any): void {
        this.api.postMessage(message);
    }

    public getState(): any {
        return this.api.getState();
    }

    public setState(state: any): void {
        this.api.setState(state);
    }
}
