// logging.ts
interface ILogger {
  log(...data: any[]): void;
  error(...data: any[]): void;
  warn(...data: any[]): void;
  debug(...data: any[]): void;
}

class WebviewLogger implements ILogger {
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
  }

  error(...data: any[]) {
    const message = this.format('ERROR', ...data);
    console.error(message);
  }

  warn(...data: any[]) {
    const message = this.format('WARN', ...data);
    console.warn(message);
  }

  debug(...data: any[]) {
    if (process.env.NODE_ENV === 'development') {
      const message = this.format('DEBUG', ...data);
      console.log(message);
    }
  }
}

// Export a singleton instance
export const logger = new WebviewLogger();
