import type { TargetObj } from '@/core/plugins';
import type { Deps, EffectFn } from './useWatch';
import { subscribe } from '@/plugins/subscribe';
import { useCallback, useRef } from 'react';
import { collectionState } from '@/plugins/reactive';
import { isPrimitive } from '@/utils/tools';
import { isRex } from '@/core';

type ComputedFn<T = any> = () => T;

const subDeps = <T extends TargetObj>(callback: EffectFn, unSubsRef: React.MutableRefObject<Set<EffectFn>>, deps: Deps<T>) => {
  deps.forEach(dep => {
    if (!isPrimitive(dep) && isRex(dep)) {
      const unSub = subscribe(dep, () => {
        callback();
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

const shadowEquals = <T extends TargetObj>(prev: Deps<T>, current: Deps<T>) => {
  return prev.length === current.length && prev.every((element, index) => element === current[index]);
};

const useComputed = <R, T extends TargetObj>(callback: ComputedFn<R>, deps: Deps<T>) => {
  const prevDeps = useRef<Deps<T>>([]);
  const unSubsRef = useRef(new Set<EffectFn>());
  const isDirty = useRef(true);
  const valueRef = useRef<R>();
  const notify = useCallback(() => {
    isDirty.current = true;
  }, []);

  // console.log('重新', isDirty.current, !shadowEquals(prevDeps.current, deps));
  if (isDirty.current || !shadowEquals(prevDeps.current, deps)) {
    prevDeps.current = deps;
    unSubDeps(unSubsRef);
    subDeps<T>(notify, unSubsRef, deps);
    // console.log('重新计算');
    if (deps.length === 0) {
      collectionState.enable = false;
      valueRef.current = callback();
      collectionState.enable = true;
    } else {
      valueRef.current = callback();
    }
    isDirty.current = false;
  }

  return valueRef.current;
};

export { useComputed };
