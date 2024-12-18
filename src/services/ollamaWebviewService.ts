import { logger } from '../utils/logging';
import { VSCodeAPI } from '../vscode-api';

export interface OllamaModel {
    name: string;
}

export class OllamaWebviewService {
    public static readonly BASE_URL = 'http://localhost:11434/api';
    private selectedModel: string = '';
    private vscode: VSCodeAPI;

    constructor() {
        this.vscode = VSCodeAPI.getInstance();
        try {
            // Initialize from any stored state
            const state = this.vscode.getState() || {};
            this.selectedModel = state.selectedModel || '';
        } catch (error) {
            logger.error('OllamaWebviewService: Error initializing:', error);
        }
        logger.log('OllamaWebviewService: Initialized');
    }

    public async fetchModels(): Promise<string[]> {
        try {
            const response = await fetch(`${OllamaWebviewService.BASE_URL}/tags`, {
                method: "GET",
            });

            if (!response.ok) {
                logger.error('OllamaWebviewService: API error:', response.status);
                return [];
            }

            const data = await response.json();

            if (!data.models || !Array.isArray(data.models)) {
                logger.error('OllamaWebviewService: Invalid models data format');
                return [];
            }

            const models = data.models.map((model: OllamaModel) => model.name);
            return models;
        } catch (error) {
            logger.error('OllamaWebviewService: Error fetching models:', error);
            return [];
        }
    }

    public getSelectedModel(): string {
        return this.selectedModel;
    }

    public setModel(model: string): void {
        try {
            this.selectedModel = model;
            // Store in webview state
            this.vscode.setState({ ...this.vscode.getState(), selectedModel: model });
            logger.log('OllamaWebviewService: Model set to', model);
        } catch (error) {
            logger.error('OllamaWebviewService: Error saving model:', error);
        }
    }

    public async listModels(): Promise<string[]> {
        try {
            this.vscode.postMessage({
                command: 'listModels'
            });
            logger.log('OllamaWebviewService: Requested model list');
            return [];  // Actual response will come through message handler
        } catch (error) {
            logger.error('OllamaWebviewService: Error listing models:', error);
            throw error;
        }
    }

    public async generate(prompt: string): Promise<void> {
        if (!this.selectedModel) {
            throw new Error('No model selected');
        }

        try {
            this.vscode.postMessage({
                command: 'generate',
                payload: {
                    model: this.selectedModel,
                    prompt
                }
            });
            logger.log('OllamaWebviewService: Generation requested', { model: this.selectedModel, prompt });
        } catch (error) {
            logger.error('OllamaWebviewService: Error generating:', error);
            throw error;
        }
    }
}
