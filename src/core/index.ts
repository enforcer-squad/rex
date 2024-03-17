import { isObject, isSymbol } from '@/utils/tools';
import type { CoreMiddleware, Handlers, Proxied, TargetObj } from './middleware';
import { getBaseHandler, execute } from './middleware';

const ITERATION_KEY = Symbol('iteration key');

class Core<T extends TargetObj> {
  targetProxyCache: WeakMap<T, Proxied<T>>;

  middlewares: Array<CoreMiddleware<T>>;

  handlers: Handlers<T>;

  constructor(middlewares: Array<CoreMiddleware<T>>) {
    this.targetProxyCache = new WeakMap<T, Proxied<T>>();
    this.middlewares = middlewares;
    this.handlers = { get: [], set: [], ownKeys: [], delete: [], apply: [], init: [] };
    this.initHandler();
  }

  initHandler() {
    this.handlers = getBaseHandler();
    this.middlewares.forEach(middleware => {
      this.use(middleware);
    });
  }

  use(middleware: CoreMiddleware<T>) {
    Reflect.ownKeys(this.handlers).forEach(type => {
      const _type = type as keyof Handlers<T>;
      const target = middleware[_type] as any;
      if (target !== undefined) {
        const baseMiddleware = this.handlers[_type].pop()!;
        this.handlers[_type].push(target.bind(middleware));
        this.handlers[_type].push(baseMiddleware as any);
      }
    });
  }

  unUse(middleware: CoreMiddleware<T>) {
    const index = this.middlewares.indexOf(middleware);
    if (index !== -1) {
      this.middlewares.splice(index, 1);
      Reflect.ownKeys(this.handlers).forEach(type => {
        const _type = type as keyof Handlers<T>;
        this.handlers[_type] = (this.handlers[_type] as any[]).filter(fn => fn !== middleware[_type]);
      });
    }
  }

  proxyObject(initObj: T, rootProxyRef?: Proxied<T>): Proxied<T> {
    if (!isObject(initObj)) {
      throw new Error('init object must be Object');
    }

    const { handlers, targetProxyCache } = this;

    const proxyCache = targetProxyCache.get(initObj);
    if (proxyCache) {
      return proxyCache;
    }

    const handler: ProxyHandler<T> = {
      get: (target, prop, receiver) => {
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

    if (rootProxyRef === undefined) {
      rootProxyRef = proxyObject;
    }

    return proxyObject;
  }
}

export { ITERATION_KEY };

export default Core;
