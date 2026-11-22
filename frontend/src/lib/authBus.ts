type Listener = () => void;

const listeners = new Set<Listener>();

export const authBus = {
  onUnauthorized(fn: Listener): () => void {
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  },
  emitUnauthorized() {
    listeners.forEach((fn) => {
      try {
        fn();
      } catch (err) {
        console.error('authBus listener error', err);
      }
    });
  },
};