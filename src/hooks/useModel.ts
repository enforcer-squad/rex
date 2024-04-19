import Core, { getCoreInstance, toRaw } from '@/core';
import type { Proxied, TargetObj } from '@/core/plugins';
import { useSafeUpdate, type SetterRef, recycleDispatch } from './useReactive';
import { ReactivePlugin } from '@/plugins/reactive';
import { SubscribePlugin } from '@/plugins/subscribe';
import { isFunction } from '@/utils/tools';
import { useMemo, useRef } from 'react';
import { useUnMount } from './tools';

const createModel = <T extends TargetObj>(initState: T) => {
  const setterRef: SetterRef<T> = {} as any;
  Object.entries(initState).forEach(([key, value]: [keyof T, any]) => {
    if (isFunction(value)) {
      initState[key] = value.bind(setterRef.current) as T[keyof T];
    }
  });
  const initSubscribePlugin = new SubscribePlugin<T>();
  const initReactivePlugin = new ReactivePlugin<T>();
  const coreInstache = new Core<T>([initSubscribePlugin, initReactivePlugin]);
  const setter = coreInstache.createSetter(initState);
  setterRef.current = setter;

  return setter;
};

const useModel = <T extends TargetObj>(model: Proxied<T>) => {
  const coreRef = useRef<Core<T>>();
  const safeUpdate = useSafeUpdate();
  recycleDispatch(coreRef.current, safeUpdate);

  const getter = useMemo(() => {
    coreRef.current = getCoreInstance(model);
    const target = toRaw(model);
    const getter = coreRef.current.createGetter(target);
    const getterId = coreRef.current.getterIdMap.get(getter)!;
    const reactivePlugin = coreRef.current.getPlugin(ReactivePlugin)!;
    reactivePlugin.updateDispatcher(getterId, safeUpdate);
    return getter;
  }, []);

  useUnMount(() => {
    recycleDispatch(coreRef.current, safeUpdate);
  });

  return getter;
};

export { createModel, useModel };
