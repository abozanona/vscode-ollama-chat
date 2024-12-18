import { workspace } from '../vscode/workspace';
import { logger } from '../utils/logging';

interface DirectoryEntry {
    name: string;
    type: 'file' | 'directory';
    children?: DirectoryEntry[];
}

export class FileOperationsService {
    private readonly workspaceRoot?: { uri: { fsPath: string } };

    constructor() {
        this.workspaceRoot = workspace.workspaceFolders?.[0];
    }

    async listDirectory(): Promise<string> {
        if (!this.workspaceRoot) {
            return 'No workspace is currently open.';
        }

        try {
            const tree = await this.buildDirectoryTree(this.workspaceRoot.uri.fsPath);
            return this.formatDirectoryTree(tree);
        } catch (error) {
            logger.error('FileOperationsService: Error listing directory:', error);
            throw error;
        }
    }

    async readFile(filePath: string): Promise<string> {
        try {
            const data = await workspace.fs.readFile(filePath);
            return new TextDecoder().decode(data);
        } catch (error) {
            logger.error('FileOperationsService: Error reading file:', error);
            throw error;
        }
    }

    async writeFile(filePath: string, content: string): Promise<void> {
        try {
            const data = new TextEncoder().encode(content);
            await workspace.fs.writeFile(filePath, data);
        } catch (error) {
            logger.error('FileOperationsService: Error writing file:', error);
            throw error;
        }
    }

    private async buildDirectoryTree(path: string): Promise<DirectoryEntry> {
        const name = path.split('/').pop() || path;
        const stat = await workspace.fs.stat(path);
        
        if (stat.type === 1) { // File
            return { name, type: 'file' as const };
        }

        // Directory
        const entries = await workspace.fs.readDirectory(path);
        const children = await Promise.all(
            entries.map(async ([childName, type]) => {
                const childPath = `${path}/${childName}`;
                if (type === 1) { // File
                    return { name: childName, type: 'file' as const };
                } else { // Directory
                    return this.buildDirectoryTree(childPath);
                }
            })
        );

        return {
            name,
            type: 'directory' as const,
            children
        };
    }

    private formatDirectoryTree(entry: DirectoryEntry, prefix = ''): string {
        let result = prefix + (entry.type === 'directory' ? '📁 ' : '📄 ') + entry.name + '\n';
        
        if (entry.type === 'directory' && entry.children) {
            const childPrefix = prefix + '  ';
            for (const child of entry.children) {
                result += this.formatDirectoryTree(child, childPrefix);
            }
        }
        
        return result;
    }
}
