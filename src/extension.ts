import * as vscode from 'vscode';
import { ChatViewProvider } from './webview/chatViewProvider';
import { extensionLogger } from './utils/extensionLogging';

export function activate(context: vscode.ExtensionContext) {
    try {
        extensionLogger.debug('Activating extension...');
        
        // Create and show panel
        const provider = new ChatViewProvider(context.extensionUri);
        
        // Register the webview provider
        const webviewProvider = vscode.window.registerWebviewViewProvider(
            'ollama-chat-sidebar',
            provider,
            {
                webviewOptions: { retainContextWhenHidden: true }
            }
        );
        context.subscriptions.push(webviewProvider);
        extensionLogger.debug('Registered webview provider');

        // Register the command
        const startChatCommand = vscode.commands.registerCommand('vscode-ollama-chat.startChat', () => {
            extensionLogger.debug('Starting chat...');
            vscode.commands.executeCommand('workbench.view.extension.ollama-chat-sidebar');
        });
        context.subscriptions.push(startChatCommand);
        extensionLogger.debug('Registered start chat command');

        extensionLogger.log('Extension activated successfully');
    } catch (error) {
        extensionLogger.error('Failed to activate extension:', error);
        throw error;
    }
}

export function deactivate() {
    extensionLogger.log('Extension deactivated');
    extensionLogger.dispose();
}
