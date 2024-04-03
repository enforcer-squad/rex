import type { TargetObj, Proxied } from '@/core/plugins';
import { subscribe } from '@/plugins/subscribe';
import { useCallback, useEffect, useRef } from 'react';
import { collectionState } from '@/plugins/reactive';
import { isRex } from '@/core';

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
    console.log('触犯回调');
    isDirty.current = true;
  }, []);

  useEffect(() => {
    deps.forEach(dep => {
      if (isRex(dep)) {
        console.log('开始监听', dep);

        subscribe(dep, notify);
      }
    });
    console.log('xxxx', deps);

    return () => {
      console.log('重置状态');

      isDirty.current = true;
      // 取消监听
    };
  }, [...deps]);
};

export { useWatch };
