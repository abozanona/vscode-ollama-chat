import { VSCodeAPI } from '../vscode-api';

export class WebviewLogger {
    private vscodeApi: VSCodeAPI;

    constructor() {
        this.vscodeApi = VSCodeAPI.getInstance();
    }

    private getTimestamp(): string {
        return new Date().toISOString();
    }

    private format(level: string, ...data: any[]): string {
        const timestamp = this.getTimestamp();
        return `[${timestamp}] [${level}] ${data.map(item => 
            typeof item === 'object' ? JSON.stringify(item, null, 2) : item
        ).join(' ')}`;
    }

    log(...data: any[]) {
        const message = this.format('INFO', ...data);
        console.log(message);
        this.vscodeApi.postMessage({ type: 'log', message });
    }

    error(...data: any[]) {
        const message = this.format('ERROR', ...data);
        console.error(message);
        this.vscodeApi.postMessage({ type: 'error', message });
    }

    warn(...data: any[]) {
        const message = this.format('WARN', ...data);
        console.warn(message);
        this.vscodeApi.postMessage({ type: 'warn', message });
    }
}

export const webviewLogger = new WebviewLogger();
