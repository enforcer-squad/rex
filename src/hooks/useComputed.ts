import type { TargetObj, Proxied } from '@/core/plugins';
import { subscribe } from '@/plugins/subscribe';
import { useCallback, useEffect, useRef } from 'react';

import { collectionState } from '@/plugins/reactive';

type ComputedFn<T = any> = () => T;

// TODO: 值类型deps处理
// TODO: deps本身被替换的情况处理
const useComputed = <R>(callback: ComputedFn<R>, deps: Array<Proxied<TargetObj>>) => {
  const isDirty = useRef(true);
  const value = useRef<R>();
  if (isDirty.current) {
    console.log('重新计算');
    if (deps.length === 0) {
      collectionState.enable = false;
      value.current = callback();
      collectionState.enable = true;
    } else {
      value.current = callback();
    }

    isDirty.current = false;
  }

  const notify = useCallback(() => {
    isDirty.current = true;
  }, []);

  // TODO: 卸载待处理
  useEffect(() => {
    deps.forEach(dep => {
      subscribe(dep, notify);
    });
  }, []);

  return value.current;
};

export { useComputed };
