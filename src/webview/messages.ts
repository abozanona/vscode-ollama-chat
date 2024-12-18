// Outgoing message types (extension to webview)
export type ExtensionOutgoingCommand = 'setModels' | 'modelSelected' | 'loading' | 'streamMessage' | 'error';

export interface BaseExtensionMessage {
    command: ExtensionOutgoingCommand;
}

export interface SetModelsMessage extends BaseExtensionMessage {
    command: 'setModels';
    models: string[];
}

export interface ModelSelectedMessage extends BaseExtensionMessage {
    command: 'modelSelected';
    model: string;
}

export interface LoadingMessage extends BaseExtensionMessage {
    command: 'loading';
    loading: boolean;
}

export interface StreamMessageMessage extends BaseExtensionMessage {
    command: 'streamMessage';
    text: string;
    done: boolean;
}

export interface ErrorMessage extends BaseExtensionMessage {
    command: 'error';
    text: string;
}

export type WebviewMessage = SetModelsMessage | ModelSelectedMessage | LoadingMessage | StreamMessageMessage | ErrorMessage;

// Incoming message types (webview to extension)
export type WebviewIncomingCommand = 'sendMessage' | 'selectModel';

export interface BaseWebviewIncomingMessage {
    command: WebviewIncomingCommand;
}

export interface SendMessageMessage extends BaseWebviewIncomingMessage {
    command: 'sendMessage';
    message: string;
}

export interface SelectModelMessage extends BaseWebviewIncomingMessage {
    command: 'selectModel';
    model: string;
}

export type WebviewIncomingMessage = SendMessageMessage | SelectModelMessage;
