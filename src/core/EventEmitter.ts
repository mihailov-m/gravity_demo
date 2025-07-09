type Listener<TArgs extends unknown[] = []> = (...args: TArgs) => void;

export class EventEmitter<TEventMap extends Record<string, unknown[]>> {
  private listeners: {
    [K in keyof TEventMap]?: Set<Listener<TEventMap[K]>>;
  } = {};

  public on<K extends keyof TEventMap>(event: K, callback: Listener<TEventMap[K]>): void {
    if (!this.listeners[event]) {
      this.listeners[event] = new Set();
    }

    this.listeners[event]!.add(callback);
  }

  public off<K extends keyof TEventMap>(event: K, callback: Listener<TEventMap[K]>): void {
    this.listeners[event]?.delete(callback);
  }

  public emit<K extends keyof TEventMap>(event: K, ...args: TEventMap[K]): void {
    this.listeners[event]?.forEach((fn) => fn(...args));
  }
}
