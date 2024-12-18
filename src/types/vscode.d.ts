declare module 'vscode' {
    export interface OutputChannel {
        name: string;
        append(value: string): void;
        appendLine(value: string): void;
        clear(): void;
        show(preserveFocus?: boolean): void;
        hide(): void;
        dispose(): void;
    }

    export interface ExtensionContext {
        subscriptions: { dispose(): any }[];
        extensionPath: string;
        globalState: Memento;
        workspaceState: Memento;
        logPath: string;
        storagePath?: string;
        globalStoragePath: string;
        extensionUri: Uri;
        environmentVariableCollection: EnvironmentVariableCollection;
    }

    export interface Uri {
        scheme: string;
        authority: string;
        path: string;
        query: string;
        fragment: string;
        fsPath: string;
        with(change: { scheme?: string; authority?: string; path?: string; query?: string; fragment?: string }): Uri;
        toString(skipEncoding?: boolean): string;
    }

    export interface Memento {
        get<T>(key: string): T | undefined;
        get<T>(key: string, defaultValue: T): T;
        update(key: string, value: any): Thenable<void>;
    }

    export interface EnvironmentVariableCollection {
        persistent: boolean;
        replace(variable: string, value: string): void;
        append(variable: string, value: string): void;
        prepend(variable: string, value: string): void;
        get(variable: string): EnvironmentVariableMutator | undefined;
        forEach(callback: (variable: string, mutator: EnvironmentVariableMutator, collection: EnvironmentVariableCollection) => any, thisArg?: any): void;
        delete(variable: string): void;
        clear(): void;
    }

    export interface EnvironmentVariableMutator {
        readonly type: EnvironmentVariableMutatorType;
        readonly value: string;
    }

    export enum EnvironmentVariableMutatorType {
        Replace = 1,
        Append = 2,
        Prepend = 3
    }

    export function window(): {
        createOutputChannel(name: string): OutputChannel;
    };
}
