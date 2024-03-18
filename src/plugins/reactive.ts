import Core from '@/core';
import type { TargetObj, IPlugin, Proxied } from '@/core/plugins';
import { type FunctionComponent, memo, useCallback, useLayoutEffect, useMemo, useReducer, useRef } from 'react';

type DispatchFn = (...args: any[]) => void;

class ReactivePlugin<T extends TargetObj> implements IPlugin<T> {
  isReadOnly = true;
  core: Core<T> | undefined;
  listenersMap = new WeakMap<T, Map<keyof T, Set<DispatchFn>>>();
  constructor(private readonly dispatch: DispatchFn) {}

  setup(core: Core<T>) {
    this.core = core;
  }

  get: IPlugin<T>['get'] = (context, next, target, prop, receiver) => {
    if (prop === '__isRex') {
      next(context, next, target, prop, receiver);
      return;
    }

    next(context, next, target, prop, receiver);
    const propsListeners = this.listenersMap.get(target) || new Map();
    const listeners = propsListeners.get(prop) || new Set();
    listeners.add(this.dispatch);
    propsListeners.set(prop, listeners);
    this.listenersMap.set(target, propsListeners);
  };

  set: IPlugin<T>['set'] = (context, next, target, prop, newValue, receiver) => {
    console.log('set trap', target, prop, this.isReadOnly);
    if (this.isReadOnly) {
      throw new Error(`attempt to set property ${String(prop)} to ${newValue}. This object is read-only.`);
    }
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

const useSafeUpdate = () => {
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  const isMountedRef = useRef(false);

  useLayoutEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return useCallback(() => {
    if (isMountedRef.current) {
      forceUpdate();
    }
  }, []);
};

type UpdateFn<T extends TargetObj> = (draft: Proxied<T>) => void;
type ReactiveReturn<T extends TargetObj> = [Proxied<T>, (draft: UpdateFn<T>) => void];

const useReactive = <T extends TargetObj>(initObj: T) => {
  const safeUpdate = useSafeUpdate();
  const result = useMemo<ReactiveReturn<T>>(() => {
    const reactivePlugin = new ReactivePlugin<T>(safeUpdate);
    const core = new Core<T>([reactivePlugin]);
    const state = core.proxyObject(initObj);
    const setState = (fn: UpdateFn<T>): void => {
      reactivePlugin.isReadOnly = false;
      fn(state);
      reactivePlugin.isReadOnly = true;
    };
    return [state, setState];
  }, []);

  return result;
};

const reactiveMemo = <P>(Component: FunctionComponent<P>) => {
  const Com = memo(Component);
  return Com;
  // return memo((props)=>{
  //    return <Component {...props}  />;
  // });
};
export type { DispatchFn };

export { ReactivePlugin, useReactive, reactiveMemo };
