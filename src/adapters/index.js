/**
 * Registro de Adapters (Browser version)
 * Os adapters são carregados como classes globais via tags <script> no index.html.
 */
class AdapterRegistry {
  constructor() {
    this.adapters = new Map();
    this.weights  = new Map();
    this.usage    = new Map();
  }

  register(name, instance, weight = 5) {
    this.adapters.set(name, instance);
    this.weights.set(name, weight);
  }

  getAdapter(name) { return this.adapters.get(name); }
  getWeight(name)  { return this.weights.get(name) || 0; }
  allAdapters()    { return [...this.adapters.entries()]; }

  recordCall(name) {
    const u = this.usage.get(name) || { count: 0, lastCall: null };
    u.count += 1;
    u.lastCall = new Date().toISOString();
    this.usage.set(name, u);
  }

  getUsage(name) { return this.usage.get(name) || { count: 0, lastCall: null }; }
}

// Singleton global
const adapterRegistry = new AdapterRegistry();
