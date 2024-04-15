import type { TargetObj, Proxied } from '@/core/plugins';
import { subscribe } from '@/plugins/subscribe';
import { useEffect, useRef } from 'react';
import { collectionState } from '@/plugins/reactive';
import { isRex } from '@/core';

type EffectFn = () => void | EffectFn;

const useWatch = (callback: EffectFn, deps: Array<Proxied<TargetObj>>) => {
  const refUnSubs = useRef(new Set<() => void>());
  useEffect(() => {
    deps.forEach(dep => {
      if (isRex(dep)) {
        const unSub = subscribe(
          dep,
          () => {
            collectionState.enable = false;
            callback();
            collectionState.enable = true;
          },
          false,
        );

        const unSubCB = () => {
          unSub();
          refUnSubs.current.delete(unSubCB);
        };
        refUnSubs.current.add(unSubCB);
      }
    });
    return () => {
      for (const unSub of refUnSubs.current) {
        unSub();
      }
    };
  }, [...deps]);
};

export { useWatch };
