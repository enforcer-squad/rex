import type { TargetObj, Proxied, PrimitiveType } from '@/core/plugins';
import { subscribe } from '@/plugins/subscribe';
import { useEffect, useRef } from 'react';
import { collectionState } from '@/plugins/reactive';
import { isRex } from '@/core';
import { isPrimitive } from '@/utils/tools';

type EffectFn = () => void | EffectFn;

type Deps<T extends TargetObj> = Array<Proxied<T> | PrimitiveType>;

const subDeps = <T extends TargetObj>(callback: EffectFn, unMountRef: React.MutableRefObject<any>, unSubsRef: React.MutableRefObject<Set<EffectFn>>, deps: Deps<T>) => {
  deps.forEach(dep => {
    if (!isPrimitive(dep) && isRex(dep)) {
      const unSub = subscribe(dep, () => {
        dep.__rex_vary = dep.__rex_vary ? dep.__rex_vary + 1 : 1;
      });

      const unSubCB = () => {
        unSub();
        unSubsRef.current.delete(unSubCB);
      };

      unSubsRef.current.add(unSubCB);
    }
  });
};

const unSubDeps = (unSubsRef: React.MutableRefObject<Set<EffectFn>>) => {
  for (const unSub of unSubsRef.current) {
    unSub();
  }
};

const getDeps = <T extends TargetObj>(deps: Deps<T>) => {
  return deps.map(dep => {
    if (!isPrimitive(dep) && isRex(dep)) {
      return dep.__rex_vary;
    }
    return dep;
  });
};

const useWatch = <T extends TargetObj>(callback: EffectFn, deps: Deps<T>) => {
  const unSubsRef = useRef(new Set<EffectFn>());
  const unMountRef = useRef<any>();

  useEffect(() => {
    if (deps.length !== 0) {
      subDeps(callback, unMountRef, unSubsRef, deps);
    }
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
  }, [...getDeps(deps)]);
};

export type { EffectFn, Deps };

export { useWatch };
