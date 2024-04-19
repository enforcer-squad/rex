import type { FunctionComponent } from 'react';
import type { PrimitiveType, DispatchFn, Proxied, TargetObj } from '@/core/plugins';
import Core, { getCoreInstance, isRex, toRaw } from '@/core';
import { ReactivePlugin } from '@/plugins/reactive';
import { SubscribePlugin } from '@/plugins/subscribe';
import { isFunction, isPrimitive } from '@/utils/tools';
import { memo, useCallback, useLayoutEffect, useMemo, useReducer, useRef, useEffect } from 'react';
import { useUnMount } from './tools';

type SetterRef<T extends TargetObj> = { current: Proxied<T> };
type GetterRef<T extends TargetObj> = { current: Proxied<T> };
type UpdateFn<T extends TargetObj> = (draft: Proxied<T>) => void;
type InitObj<T extends TargetObj> = T | PrimitiveType | null | undefined;
type SetState<T extends TargetObj> = (draft: InitObj<T> | UpdateFn<T>) => void;
type ReactiveReturn<T extends TargetObj> = [GetterRef<T>, SetState<T>];

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

const recycleDispatchBatch = <P extends TargetObj>(props: P, dispatchFn: DispatchFn) => {
  Object.keys(props).forEach(key => {
    const prop = props[key];
    if (isRex(prop)) {
      const proxyTarget = prop;
      const core = getCoreInstance(proxyTarget);
      recycleDispatch(core, dispatchFn);
    }
  });
};

const updateAccessor = <T extends TargetObj>(initObj: InitObj<T>, dispatchFn: DispatchFn, setState: (fn: InitObj<T> | UpdateFn<T>) => void, core: React.MutableRefObject<Core<T> | undefined>, setterRef: SetterRef<T>, getterRef: GetterRef<T>) => {
  if (initObj === undefined || initObj === null) {
    if (Reflect.has(setterRef, 'current') && (setterRef.current as any) === initObj) {
      return false;
    }
    setterRef.current = initObj as any;
    getterRef.current = initObj as any;

    return true;
  }
  let target = initObj;
  if (isPrimitive(target)) {
    if (setterRef.current) {
      (setterRef.current as any).value = target;
      return false;
    }
    target = { value: target } as unknown as T;
  }
  if (core.current === undefined) {
    const initSubscribePlugin = new SubscribePlugin<T>();
    const initReactivePlugin = new ReactivePlugin<T>();
    core.current = new Core<T>([initSubscribePlugin, initReactivePlugin]);
  }
  const setter = core.current.createSetter(target);
  const getter = core.current.createGetter(target);
  const getterId = core.current.getterIdMap.get(getter)!;
  const reactivePlugin = core.current.getPlugin(ReactivePlugin)!;
  reactivePlugin.updateDispatcher(getterId, dispatchFn);

  setterRef.current = setter;
  getterRef.current = getter;
  return true;
};

const useReactive = <T extends TargetObj>(initObj: InitObj<T> = undefined): [Proxied<T>, SetState<T>] => {
  const coreRef = useRef<Core<T>>();
  const safeUpdate = useSafeUpdate();
  recycleDispatch(coreRef.current, safeUpdate);

  const [getter, setter] = useMemo<ReactiveReturn<T>>(() => {
    const setterRef: SetterRef<T> = {} as any;
    const getterRef: GetterRef<T> = {} as any;
    const setState = (fn: InitObj<T> | UpdateFn<T>): void => {
      if (isFunction(fn)) {
        fn(setterRef.current);
        return;
      }
      const needUpdate = updateAccessor(fn, safeUpdate, setState, coreRef, setterRef, getterRef);
      needUpdate && safeUpdate();
    };

    updateAccessor(initObj, safeUpdate, setState, coreRef, setterRef, getterRef);
    return [getterRef, setState];
  }, []);

  useUnMount(() => {
    // 不需要添加其他的了 weakmap加react函数释放
    recycleDispatch(coreRef.current, safeUpdate);
  });

  return [getter?.current, setter];
};

const reactiveMemo = <P extends TargetObj>(Component: FunctionComponent<P>) => {
  return memo((props: P) => {
    const propsRef = useRef<P>({} as unknown as P);
    const safeUpdate = useSafeUpdate();
    propsRef.current = props;

    recycleDispatchBatch(props, safeUpdate);

    const _props = useMemo(() => {
      // console.log('重新计算props');

      return Object.keys(props).reduce<any>((ret, key) => {
        if (isRex(props[key])) {
          const proxyTarget = props[key];
          const core = getCoreInstance(proxyTarget);
          const target = toRaw(proxyTarget);
          const getter = core.createGetter(target);
          const getterId = core.getterIdMap.get(getter)!;
          const reactivePlugin = core.getPlugin(ReactivePlugin)!;
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
        recycleDispatchBatch(propsRef.current, safeUpdate);
      };
    }, []);

    return Component(_props);
  });
};
export type { SetterRef };
export { useSafeUpdate, useReactive, reactiveMemo, recycleDispatch };
