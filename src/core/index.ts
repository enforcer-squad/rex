import { isObject, isSymbol } from '@/utils/tools';
import type { IPlugin, Handlers, Proxied, TargetObj } from './plugins';
import { getBaseHandler, execute } from './plugins';

const ITERATION_KEY = Symbol('iteration key');

class Core<T extends TargetObj> {
  state: T | undefined;
  targetProxyCache: WeakMap<T, Proxied<T>>;

  handlers: Handlers<T>;

  constructor(private readonly plugins: Array<IPlugin<T>>) {
    this.targetProxyCache = new WeakMap<T, Proxied<T>>();
    this.handlers = { get: [], set: [], ownKeys: [], delete: [], apply: [], init: [] };
    this.initHandler();
  }

  initHandler() {
    this.handlers = getBaseHandler();
    this.plugins.forEach(plugin => {
      this.use(plugin);
    });
  }

  use(plugin: IPlugin<T>) {
    plugin.setup(this);
    Reflect.ownKeys(this.handlers).forEach(type => {
      const _type = type as keyof Handlers<T>;
      const target = plugin[_type] as any;
      if (target !== undefined) {
        const baseHandler = this.handlers[_type].pop()!;
        this.handlers[_type].push(target.bind(plugin));
        this.handlers[_type].push(baseHandler as any);
      }
    });
  }

  unUse(plugin: IPlugin<T>) {
    const index = this.plugins.indexOf(plugin);
    if (index !== -1) {
      this.plugins.splice(index, 1);
      Reflect.ownKeys(this.handlers).forEach(type => {
        const _type = type as keyof Handlers<T>;
        this.handlers[_type] = (this.handlers[_type] as any[]).filter(fn => fn !== plugin[_type]);
      });
    }
  }

  private attachTag(initObj: T) {
    Object.defineProperty(initObj, '__isRex', {
      get() {
        return true;
      },
      enumerable: false,
    });
  }

  proxyObject(initObj: T, rootProxyRef?: Proxied<T>): Proxied<T> {
    if (!isObject(initObj)) {
      throw new Error('init object must be Object');
    }

    const { handlers, targetProxyCache, attachTag } = this;

    const proxyCache = targetProxyCache.get(initObj);
    if (proxyCache) {
      return proxyCache;
    }

    const handler: ProxyHandler<T> = {
      get: (target, prop, receiver) => {
        console.log('get trap', target, prop);

        const { value } = execute(handlers.get, target, prop, receiver);
        if (isObject(value)) {
          const tmpObj = value as T;
          return this.proxyObject(tmpObj, rootProxyRef);
        }
        return value;
      },
      set: (target, prop, newValue, receiver) => {
        if (isSymbol(prop)) {
          return Reflect.set(target, prop, newValue, receiver);
        }
        const prevValue = target[prop];

        if (prevValue === newValue) {
          return true;
        }
        const { value } = execute(handlers.set, target, prop, newValue, receiver);
        return value;
      },
      ownKeys: target => {
        const { value } = execute(handlers.ownKeys, target);
        return value;
      },
      deleteProperty: (target, prop) => {
        const { value } = execute(handlers.delete, target, prop);
        return value;
      },
      apply: (target, thisArg, argArray) => {
        const { value } = execute(handlers.apply, target, thisArg, argArray, rootProxyRef);
        return value;
      },
    };
    const { value: proxyObject } = execute(handlers.init, initObj, handler);
    targetProxyCache.set(initObj, proxyObject);
    attachTag(initObj);

    if (rootProxyRef === undefined) {
      rootProxyRef = proxyObject;
      this.state = initObj;
    }

    return proxyObject;
  }
}

export { ITERATION_KEY };

export default Core;
