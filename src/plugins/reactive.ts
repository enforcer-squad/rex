import type Core from '@/core';
import type { TargetObj, IPlugin, DispatchFn, Proxied } from '@/core/plugins';

const ITERATION_KEY = Symbol('iteration key');

const collectionState = {
  enable: true,
};

class ReactivePlugin<T extends TargetObj> implements IPlugin<T> {
  core: Core<T> | undefined;
  listenersMap = new WeakMap<T, Map<keyof T, Set<DispatchFn>>>();
  dispatchersMap = new Map<string, DispatchFn>();
  recycleMap = new WeakMap<DispatchFn, Map<T, Set<keyof T>>>();

  setup(core: Core<T>) {
    this.core = core;
  }

  updateDispatcher = (getterId: string, dispatch: DispatchFn) => {
    this.dispatchersMap.set(getterId, dispatch);
  };

  getDispatcher = (target: Proxied<T>) => {
    const getterId = this.core?.getterIdMap.get(target);
    const dispatcher = this.dispatchersMap.get(getterId!);
    return dispatcher;
  };

  private readonly registerDispatcher = (target: T, prop: keyof T, receiver: Proxied<T>) => {
    const { listenersMap, getDispatcher, recycleMap } = this;
    // 添加回调
    const propsListeners = listenersMap.get(target) || new Map();
    const listeners = propsListeners.get(prop) || new Set();
    const dispatcher = getDispatcher(receiver);
    if (!dispatcher) {
      return;
    }
    listeners.add(dispatcher);
    propsListeners.set(prop, listeners);
    listenersMap.set(target, propsListeners);

    // 添加回收
    const currentCallbackDeps = recycleMap.get(dispatcher) || new Map<T, Set<keyof T>>();
    const callback = currentCallbackDeps.get(target) || new Set<keyof T>();
    callback.add(prop);
    currentCallbackDeps.set(target, callback);
    recycleMap.set(dispatcher, currentCallbackDeps);
  };

  get: IPlugin<T>['get'] = (context, next, target, prop, receiver) => {
    console.log('get trap', target, prop);

    next(context, next, target, prop, receiver);

    if (!collectionState.enable) {
      return;
    }

    this.registerDispatcher(target, prop, receiver);
  };

  set: IPlugin<T>['set'] = (context, next, target, prop, newValue, receiver) => {
    console.log('set trap', target, prop, newValue);

    const hasKey = Reflect.has(target, prop);
    const prevValue = target[prop];

    next(context, next, target, prop, newValue, receiver);

    const propsListeners = this.listenersMap.get(target);
    const listeners = propsListeners?.get(prop);

    if (propsListeners && listeners) {
      listeners.forEach(listener => {
        listener(newValue, prevValue);
      });
    }

    const iterationListeners = propsListeners?.get(ITERATION_KEY as keyof T);
    if (!hasKey && iterationListeners) {
      iterationListeners.forEach(listener => {
        listener(prop);
      });
    }
  };

  ownKeys: IPlugin<T>['ownKeys'] = (context, next, target, receiver) => {
    console.log('ownKeys trap', target);

    next(context, next, target, receiver);

    if (!collectionState.enable) {
      return;
    }
    this.registerDispatcher(target, ITERATION_KEY as keyof T, receiver);
  };

  delete: IPlugin<T>['delete'] = (context, next, target, prop) => {
    console.log('delete trap', target, prop);

    next(context, next, target, prop);

    const propsListeners = this.listenersMap.get(target);
    const listeners = propsListeners?.get(prop);
    if (propsListeners && listeners) {
      listeners.forEach(listener => {
        listener(prop);
      });
    }

    const iterationListeners = propsListeners?.get(ITERATION_KEY as keyof T);
    if (iterationListeners) {
      iterationListeners.forEach(listener => {
        listener(prop);
      });
    }
  };
}

export { collectionState, ReactivePlugin };
