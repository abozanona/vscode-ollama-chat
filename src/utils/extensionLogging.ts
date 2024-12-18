import * as vscode from 'vscode';

export class ExtensionLogger {
  private outputChannel: vscode.OutputChannel;

  constructor(channelName: string = 'Ollama Chat') {
    this.outputChannel = vscode.window.createOutputChannel(channelName);
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
    this.outputChannel.appendLine(message);
  }

  error(...data: any[]) {
    const message = this.format('ERROR', ...data);
    this.outputChannel.appendLine(message);
    this.outputChannel.show(true);
  }

  warn(...data: any[]) {
    const message = this.format('WARN', ...data);
    this.outputChannel.appendLine(message);
  }

  debug(...data: any[]) {
    if (process.env.NODE_ENV === 'development') {
      const message = this.format('DEBUG', ...data);
      this.outputChannel.appendLine(message);
    }
  }

  show() {
    this.outputChannel.show(true);
  }

  dispose() {
    this.outputChannel.dispose();
  }
}

export const extensionLogger = new ExtensionLogger();
