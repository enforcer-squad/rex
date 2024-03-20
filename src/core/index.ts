import { v4 } from 'uuid';
import { isObject, isSymbol } from '@/utils/tools';
import type { IPlugin, Handlers, Proxied, TargetObj } from './plugins';
import { getBaseHandler, execute } from './plugins';

const ITERATION_KEY = Symbol('iteration key');

class Core<T extends TargetObj> {
  setterProxyCache = new WeakMap<T, Proxied<T>>();
  getterProxyCache = new Map<string, WeakMap<T, Proxied<T>>>();
  getterIdMap = new WeakMap<T, string>();

  handlers: Handlers<T>;

  constructor(private readonly plugins: Array<IPlugin<T>>) {
    this.handlers = { get: [], set: [], ownKeys: [], delete: [], apply: [], init: [] };
    this.initHandler();
  }

  initHandler() {
    this.handlers = getBaseHandler();
    this.plugins.forEach(plugin => {
      this.use(plugin);
    });
  }

  getPlugin(ctor: new () => any) {
    return this.plugins.find(plugin => plugin instanceof ctor);
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
    if (!('__isRex' in initObj)) {
      Object.defineProperty(initObj, '__isRex', {
        get() {
          return true;
        },
        enumerable: false,
      });
    }
  }

  createSetter(initObj: T, rootProxyRef?: Proxied<T>): Proxied<T> {
    if (!isObject(initObj)) {
      throw new Error('init object must be Object');
    }
    const { handlers, setterProxyCache, attachTag } = this;

    const proxyCache = setterProxyCache.get(initObj);
    if (proxyCache) {
      return proxyCache;
    }

    const handler: ProxyHandler<T> = {
      get: (target, prop, receiver) => {
        const value = Reflect.get(target, prop, receiver);
        if (isObject(value)) {
          const tmpObj = value as T;
          return this.createSetter(tmpObj, rootProxyRef);
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
        const value = Reflect.ownKeys(target);
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

    if (rootProxyRef === undefined) {
      rootProxyRef = proxyObject;
    }

    attachTag(initObj);
    setterProxyCache.set(initObj, proxyObject);

    return proxyObject;
  }

  createGetter(initObj: T, getterId?: string): Proxied<T> {
    if (!isObject(initObj)) {
      throw new Error('init object must be Object');
    }

    const { handlers, getterProxyCache, getterIdMap, attachTag } = this;

    if (getterId !== undefined) {
      const cacheMap = getterProxyCache.get(getterId);
      const proxyCache = cacheMap?.get(initObj);
      if (proxyCache) {
        return proxyCache;
      }
    }

    const handler: ProxyHandler<T> = {
      get: (target, prop, receiver) => {
        if (prop === '__origin') {
          return target;
        } else if (prop === '__core') {
          return this;
        } else if (prop === '__isRex') {
          return Reflect.get(target, prop, receiver);
        }
        const { value } = execute(handlers.get, target, prop, receiver);
        if (isObject(value)) {
          const tmpObj = value as T;
          return this.createGetter(tmpObj, getterId);
        }
        return value;
      },
      set: (target, prop, newValue, receiver) => {
        throw new Error(`attempt to set property ${String(prop)} to ${newValue}. This object is read-only.`);
      },
      ownKeys: target => {
        const { value } = execute(handlers.ownKeys, target);
        return value;
      },
      deleteProperty: (target, prop) => {
        throw new Error(`attempt to delete property ${String(prop)}. This object is read-only.`);
      },
    };
    const proxyObject = new Proxy(initObj, handler) as Proxied<T>;
    if (getterId === undefined) {
      getterId = v4();
    }

    attachTag(initObj);
    const cache = getterProxyCache.get(getterId) || new WeakMap<T, Proxied<T>>();
    cache.set(initObj, proxyObject);
    getterProxyCache.set(getterId, cache);
    getterIdMap.set(initObj, getterId);

    return proxyObject;
  }
}

const isRex = <T extends TargetObj>(target: T) => {
  return target.__isRex;
};

const toRaw = (target: TargetObj) => {
  return target.__origin;
};

const getCoreInstance = <T extends TargetObj>(target: Proxied<T>) => {
  return target.__core;
};

export { ITERATION_KEY, isRex, toRaw, getCoreInstance };

export default Core;