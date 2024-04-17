import type { Proxied, TargetObj } from '@/core/plugins';
import { useRef, useState } from 'react';
import { useWatch } from './useWatch';

const useRefFn = (initialState: any) => {
  const [init] = useState(initialState);
  const ref = useRef(init);
  return ref;
};

const useRefSync = <T extends TargetObj>(initialState: Proxied<T>) => {
  const ref = useRef<Proxied<T>>(initialState);
  useWatch(() => {
    console.log('11111111111133333333');

    ref.current = initialState;
  }, [initialState]);
  return ref;
};

export { useRefFn, useRefSync };
