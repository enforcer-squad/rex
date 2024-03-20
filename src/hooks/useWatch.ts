import type { TargetObj, Proxied } from '@/core/plugins';
import { subscribe } from '@/plugins/subscribe';
import { useCallback, useEffect, useRef } from 'react';
import { collectionState } from '@/plugins/reactive';

type EffectFn = () => void | EffectFn;

const useWatch = (callback: EffectFn, deps: Array<Proxied<TargetObj>>) => {
  const isDirty = useRef(true);
  if (isDirty.current) {
    console.log('重新执行');
    if (deps.length === 0) {
      collectionState.enable = false;
      callback();
      collectionState.enable = true;
    } else {
      callback();
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
};

export { useWatch };
