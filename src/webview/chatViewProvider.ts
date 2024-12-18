import * as vscode from 'vscode';

export class ChatViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'ollama-chat-sidebar';

    constructor(
        private readonly _extensionUri: vscode.Uri,
    ) {}

    private getNonce() {
        let text = '';
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 32; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }

    private getUri(webview: vscode.Webview, ...pathSegments: string[]) {
        return webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, ...pathSegments));
    }

    public async resolveWebviewView(
        webviewView: vscode.WebviewView,
        _context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                this._extensionUri
            ]
        };

        const scriptUri = this.getUri(webviewView.webview, 'dist', 'main.js');
        const styleUri = this.getUri(webviewView.webview, 'dist', 'main.css');
        const nonce = this.getNonce();

        webviewView.webview.html = `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webviewView.webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}' ${webviewView.webview.cspSource}; connect-src http://localhost:11434;">
                <link href="${styleUri}" rel="stylesheet">
                <title>Ollama Chat</title>
            </head>
            <body>
                <div id="app"></div>
                <script nonce="${nonce}">
                    // Initialize VS Code API and store it globally
                    if (!window.__vscodeApi) {
                        window.__vscodeApi = acquireVsCodeApi();
                    }
                    const vscode = window.__vscodeApi;
                </script>
                <script nonce="${nonce}" type="module" src="${scriptUri}"></script>
            </body>
            </html>`;
    }
}
