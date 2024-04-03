import type { TargetObj, Proxied } from '@/core/plugins';
import { subscribe } from '@/plugins/subscribe';
import { useCallback, useEffect } from 'react';
import { collectionState } from '@/plugins/reactive';
import { isRex } from '@/core';

type EffectFn = () => void | EffectFn;

const useWatch = (callback: EffectFn, deps: Array<Proxied<TargetObj>>) => {
  const executeCallback = useCallback(() => {
    console.log('重新执行');
    if (deps.length === 0) {
      collectionState.enable = false;
      callback();
      collectionState.enable = true;
    } else {
      callback();
    }
  }, []);

  useEffect(() => {
    executeCallback();
    deps.forEach(dep => {
      if (isRex(dep)) {
        console.log('开始监听', dep);
        subscribe(dep, () => {
          console.log('cccccccc');
          executeCallback();
        });
      }
    });
    return () => {
      console.log('TODO 取消监听');
      // 取消监听
    };
  }, [...deps]);
};

export { useWatch };
