import Core, { getCoreInstance, isRex, toRaw } from '@/core';
import { type DispatchFn, type Proxied, type TargetObj } from '@/core/plugins';
import { ReactivePlugin } from '@/plugins/reactive';
import { SubscribePlugin } from '@/plugins/subscribe';
import { type FunctionComponent, memo, useCallback, useLayoutEffect, useMemo, useReducer, useRef, useEffect } from 'react';

type UpdateFn<T extends TargetObj> = (draft: Proxied<T>) => void;
type ReactiveReturn<T extends TargetObj> = [Proxied<T>, (draft: UpdateFn<T>) => void];

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

const recycleDispatch = <T extends TargetObj>(core: Core<T> | undefined, dispatchFn: DispatchFn) => {
  if (!core) {
    return;
  }
  const reactivePlugin = core.getPlugin(ReactivePlugin)!;
  const depsMap = reactivePlugin.recycleMap.get(dispatchFn);
  if (depsMap) {
    depsMap.forEach((props, target) => {
      props.forEach(prop => {
        const propListeners = reactivePlugin.listenersMap.get(target)!;
        const listeners = propListeners.get(prop);
        listeners?.delete(dispatchFn);
      });
    });
    reactivePlugin.recycleMap.delete(dispatchFn);
  }
};

const useReactive = <T extends TargetObj>(initObj: T) => {
  const coreRef = useRef<Core<T>>();
  const safeUpdate = useSafeUpdate();
  recycleDispatch(coreRef.current, safeUpdate);

  const result = useMemo<ReactiveReturn<T>>(() => {
    const subscribePlugin = new SubscribePlugin<T>();
    const reactivePlugin = new ReactivePlugin<T>();
    const core = new Core<T>([subscribePlugin, reactivePlugin]);
    const setter = core.createSetter(initObj);
    const gettter = core.createGetter(initObj);
    const getterId = core.getterIdMap.get(initObj)!;
    reactivePlugin.updateDispatcher(getterId, safeUpdate);
    const setState = (fn: UpdateFn<T>): void => {
      fn(setter);
    };

    coreRef.current = core;
    return [gettter, setState];
  }, []);

  useEffect(() => {
    return () => {
      // 应该不需要添加其他的了 weakmap加react函数释放
      recycleDispatch(coreRef.current, safeUpdate);
    };
  }, []);

  return result;
};

const reactiveMemo = <P extends TargetObj>(Component: FunctionComponent<P>) => {
  return memo((props: P) => {
    const coreRef = useRef<Core<P>>();
    const safeUpdate = useSafeUpdate();
    recycleDispatch(coreRef.current, safeUpdate);

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

    useEffect(() => {
      return () => {
        recycleDispatch(coreRef.current, safeUpdate);
      };
    }, []);

    return Component(_props);
  });
};

export { useSafeUpdate, useReactive, reactiveMemo };
