/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-unused-vars */
import type Core from '@/core';
import type { TargetObj, IPlugin, Proxied, DispatchFn } from '@/core/plugins';

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
    if (!collectionState.enable) {
      next(context, next, target, prop, receiver);
      return;
    }
    next(context, next, target, prop, receiver);
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
    console.log('set trap', target, prop);
    const propsListeners = this.listenersMap.get(target);
    if (propsListeners === undefined) {
      next(context, next, target, prop, newValue, receiver);
      return;
    }
    const listeners = propsListeners.get(prop);
    if (listeners === undefined) {
      next(context, next, target, prop, newValue, receiver);
      return;
    }

    const prevValue = target[prop];
    next(context, next, target, prop, newValue, receiver);
    listeners.forEach(listener => {
      listener(newValue, prevValue);
    });
  };
}

export { collectionState, ReactivePlugin };
