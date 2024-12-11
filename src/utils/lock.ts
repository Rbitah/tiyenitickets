export class Lock {
  private isLocked = false;
  private queue: Array<(value: unknown) => void> = [];

  async acquire(): Promise<void> {
    if (!this.isLocked) {
      this.isLocked = true;
      return;
    }

    return new Promise(resolve => {
      this.queue.push(resolve);
    });
  }

  release(): void {
    if (this.queue.length > 0) {
      const nextResolve = this.queue.shift();
      nextResolve?.(undefined);
    } else {
      this.isLocked = false;
    }
  }
} 