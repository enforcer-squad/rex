/* eslint-disable @typescript-eslint/no-unused-vars */
import Core, { getCoreInstance, isRex, toRaw } from '@/core';
import type { TargetObj, IPlugin, Proxied } from '@/core/plugins';
import { type FunctionComponent, memo, useCallback, useLayoutEffect, useMemo, useReducer, useRef, useEffect } from 'react';

type DispatchFn = (...args: any[]) => void;

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
    if (prop === '__isRex' || prop === '__origin' || prop === '__core') {
      next(context, next, target, prop, receiver);
      return;
    }

    next(context, next, target, prop, receiver);
    const propsListeners = this.listenersMap.get(target) || new Map();
    const listeners = propsListeners.get(prop) || new Set();
    const dispatcher = this.getDispatcher(target);
    listeners.add(dispatcher);
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
    const reactivePlugin = new ReactivePlugin<T>();
    const core = new Core<T>([reactivePlugin]);
    const setter = core.createSetter(initObj);
    const gettter = core.createGetter(initObj);
    const getterId = core.getterIdMap.get(initObj)!;
    reactivePlugin.updateDispatcher(getterId, safeUpdate);

    const setState = (fn: UpdateFn<T>): void => {
      fn(setter);
    };
    return [gettter, setState];
  }, []);

  return result;
};

const reactiveMemo = <P extends TargetObj>(Component: FunctionComponent<P>) => {
  return memo((props: P) => {
    console.log('memo render');
    const safeUpdate = useSafeUpdate();
    const _props = useMemo(() => {
      console.log('重新计算props');

      return Object.keys(props).reduce<any>((ret, key) => {
        if (isRex(props[key])) {
          const proxyTarget = props[key];
          const core = getCoreInstance(proxyTarget);
          const target = toRaw(proxyTarget);
          const getter = core.createGetter(target);
          const getterId = core.getterIdMap.get(target)!;
          const reactivePlugin = core.getPlugin(ReactivePlugin);
          reactivePlugin.updateDispatcher(getterId, safeUpdate);
          ret[key] = getter;
        } else {
          ret[key] = props[key];
        }
        return ret;
      }, {});
    }, [safeUpdate, ...Object.values(props)]);
    return Component(_props);
  });
};
export type { DispatchFn };

export { ReactivePlugin, useReactive, reactiveMemo };
