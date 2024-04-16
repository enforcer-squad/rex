/* eslint-disable @typescript-eslint/no-unused-vars */
import type { TargetObj, Proxied, PrimitiveType } from '@/core/plugins';
import { subscribe } from '@/plugins/subscribe';
import { useEffect, useRef } from 'react';
import { collectionState } from '@/plugins/reactive';
import { isRex } from '@/core';
import { isPrimitive } from '@/utils/tools';

type EffectFn = () => void | EffectFn;

type Deps<T extends TargetObj> = Array<Proxied<T> | PrimitiveType>;

const subDeps = <T extends TargetObj>(callback: EffectFn, unMountRef: React.MutableRefObject<any>, callbackRef: React.MutableRefObject<Set<EffectFn>>, deps: Deps<T>) => {
  deps.forEach(dep => {
    if (!isPrimitive(dep) && isRex(dep)) {
      const unSub = subscribe(dep, () => {
        if (deps.length === 0) {
          collectionState.enable = false;
        }
        unMountRef.current = callback();
        if (deps.length === 0) {
          collectionState.enable = true;
        }
      });

      const unSubCB = () => {
        unSub();
        callbackRef.current.delete(unSubCB);
      };

      callbackRef.current.add(unSubCB);
    }
  });
};

const unSubDeps = (callbackRef: React.MutableRefObject<Set<EffectFn>>) => {
  for (const unSub of callbackRef.current) {
    unSub();
  }
};

const useWatch = <T extends TargetObj>(callback: EffectFn, deps: Deps<T>) => {
  const unSubsRef = useRef(new Set<EffectFn>());
  const unMountRef = useRef<any>();

  useEffect(() => {
    subDeps(callback, unMountRef, unSubsRef, deps);
    if (deps.length === 0) {
      collectionState.enable = false;
    }
    unMountRef.current = callback();
    if (deps.length === 0) {
      collectionState.enable = true;
    }
    return () => {
      unSubDeps(unSubsRef);
      unMountRef.current?.();
    };
  }, [...deps]);
};

export { useWatch };
