import Core, { getCoreInstance, isRex, toRaw } from '@/core';
import { type Proxied, type TargetObj } from '@/core/plugins';
import { ReactivePlugin } from '@/plugins/reactive';
import { SubscribePlugin } from '@/plugins/subscribe';
import { type FunctionComponent, memo, useCallback, useLayoutEffect, useMemo, useReducer, useRef } from 'react';

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

const useReactive = <T extends TargetObj>(initObj: T) => {
  const safeUpdate = useSafeUpdate();
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
    return [gettter, setState];
  }, []);

  return result;
};

const reactiveMemo = <P extends TargetObj>(Component: FunctionComponent<P>) => {
  return memo((props: P) => {
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

export { useSafeUpdate, useReactive, reactiveMemo };
