import { VSCodeAPI } from '../vscode-api';

export interface WorkspaceFolder {
    uri: {
        fsPath: string;
    };
}

export interface FileSystem {
    readFile(path: string): Promise<Uint8Array>;
    writeFile(path: string, content: Uint8Array): Promise<void>;
    stat(path: string): Promise<{ type: number }>;
    readDirectory(path: string): Promise<[string, number][]>;
}

// VS Code message types
interface VSCodeMessage {
    type: string;
    command: string;
    payload?: any;
}

class VSCodeWorkspace {
    private static instance: VSCodeWorkspace;
    private vscodeApi: VSCodeAPI;
    private messageHandlers: Map<string, (payload: any) => void>;

    private constructor() {
        this.vscodeApi = VSCodeAPI.getInstance();
        this.messageHandlers = new Map();

        if (typeof window !== 'undefined') {
            window.addEventListener('message', this.handleMessage.bind(this));
        }
    }

    public static getInstance(): VSCodeWorkspace {
        if (!VSCodeWorkspace.instance) {
            VSCodeWorkspace.instance = new VSCodeWorkspace();
        }
        return VSCodeWorkspace.instance;
    }

    private handleMessage(event: MessageEvent) {
        const message = event.data as VSCodeMessage;
        const handler = this.messageHandlers.get(message.command);
        if (handler) {
            handler(message.payload);
        }
    }

    public postMessage(message: VSCodeMessage) {
        this.vscodeApi.postMessage(message);
    }

    public addMessageHandler(command: string, handler: (payload: any) => void) {
        this.messageHandlers.set(command, handler);
    }

    public removeMessageHandler(command: string) {
        this.messageHandlers.delete(command);
    }

    get workspaceFolders(): WorkspaceFolder[] | undefined {
        return undefined; // This will be handled through messages
    }

    get fs(): FileSystem {
        return {
            async readFile(path: string): Promise<Uint8Array> {
                // Implement through message passing
                return new Uint8Array();
            },
            async writeFile(path: string, content: Uint8Array): Promise<void> {
                // Implement through message passing
            },
            async stat(path: string): Promise<{ type: number }> {
                // Implement through message passing
                return { type: 1 };
            },
            async readDirectory(path: string): Promise<[string, number][]> {
                // Implement through message passing
                return [];
            }
        };
    }
}

export const workspace = VSCodeWorkspace.getInstance();
