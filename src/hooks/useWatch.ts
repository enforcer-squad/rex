import type { TargetObj, Proxied } from '@/core/plugins';
import { subscribe } from '@/plugins/subscribe';
import { useEffect } from 'react';
import { collectionState } from '@/plugins/reactive';
import { isRex } from '@/core';

type EffectFn = () => void | EffectFn;

const useWatch = (callback: EffectFn, deps: Array<Proxied<TargetObj>>) => {
  useEffect(() => {
    deps.forEach(dep => {
      if (isRex(dep)) {
        console.log('开始监听', dep);
        subscribe(
          dep,
          () => {
            console.log('cccccccc');
            if (deps.length === 0) {
              collectionState.enable = false;
              callback();
              collectionState.enable = true;
            } else {
              callback();
            }
          },
          false,
        );
      }
    });
    return () => {
      console.log('TODO 取消监听');
      // TODO:取消监听
    };
  }, [...deps]);
};

export { useWatch };
