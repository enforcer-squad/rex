import type Core from '@/core';
import type { TargetObj, IPlugin, DispatchFn } from '@/core/plugins';

const ITERATION_KEY = Symbol('iteration key');

const collectionState = {
  enable: true,
};
class ReactivePlugin<T extends TargetObj> implements IPlugin<T> {
  core: Core<T> | undefined;
  listenersMap = new WeakMap<T, Map<keyof T, Set<DispatchFn>>>();
  dispatchersMap = new Map<string, DispatchFn>();

  setup(core: Core<T>) {
    this.core = core;
  }

  updateDispatcher = (getterId: string, dispatch: DispatchFn) => {
    this.dispatchersMap.set(getterId, dispatch);
  };

  getDispatcher = (target: T) => {
    const getterId = this.core?.getterIdMap.get(target);
    const dispatcher = this.dispatchersMap.get(getterId!);
    return dispatcher;
  };

  get: IPlugin<T>['get'] = (context, next, target, prop, receiver) => {
    console.log('get trap', target, prop);

    next(context, next, target, prop, receiver);

    if (!collectionState.enable) {
      return;
    }
    const propsListeners = this.listenersMap.get(target) || new Map();
    const listeners = propsListeners.get(prop) || new Set();
    const dispatcher = this.getDispatcher(target);
    if (dispatcher) {
      listeners.add(dispatcher);
    }
    propsListeners.set(prop, listeners);
    this.listenersMap.set(target, propsListeners);
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

  ownKeys: IPlugin<T>['ownKeys'] = (context, next, target) => {
    console.log('ownKeys trap', target);

    next(context, next, target);

    if (!collectionState.enable) {
      return;
    }
    const propsListeners = this.listenersMap.get(target) || new Map();
    const listeners = propsListeners.get(ITERATION_KEY) || new Set();
    const dispatcher = this.getDispatcher(target);
    listeners.add(dispatcher);
    propsListeners.set(ITERATION_KEY, listeners);
    this.listenersMap.set(target, propsListeners);
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
