/* eslint-disable @typescript-eslint/no-unused-vars */
import type { TargetObj, Proxied, PrimitiveType } from '@/core/plugins';
import { subscribe } from '@/plugins/subscribe';
import { useEffect, useRef } from 'react';
import { collectionState } from '@/plugins/reactive';
import { isRex } from '@/core';

type EffectFn = () => void | EffectFn;

type Deps<T extends TargetObj> = Array<Proxied<T> | PrimitiveType>;

// const subDeps = <T extends TargetObj>(deps: Deps<T>) => {
//   deps.forEach(dep => {
//     if (isRex(dep)) {
//       const unSub = subscribe(dep, () => {
//         if (deps.length === 0) {
//           collectionState.enable = false;
//         }
//         unmount.current = callback();
//         if (deps.length === 0) {
//           collectionState.enable = true;
//         }
//       });

//       const unSubCB = () => {
//         unSub();
//         refUnSubs.current.delete(unSubCB);
//       };

//       refUnSubs.current.add(unSubCB);
//     }
//   });
// };

const useWatch = <T extends TargetObj>(callback: EffectFn, deps: Deps<T>) => {
  const refUnSubs = useRef(new Set<EffectFn>());
  const unmount = useRef<any>();

  useEffect(() => {
    return () => {
      for (const unSub of refUnSubs.current) {
        unSub();
      }
      unmount.current?.();
    };
  }, [...deps]);
};

export { useWatch };
