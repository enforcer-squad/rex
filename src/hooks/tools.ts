import type { Proxied, TargetObj } from '@/core/plugins';
import { useRef, useState } from 'react';
import { useWatch } from './useWatch';

const useRefFn = (initState: any) => {
  const [init] = useState(initState);
  const ref = useRef(init);
  return ref;
};

const useRefSync = <T extends TargetObj>(initState: Proxied<T>) => {
  const ref = useRef<Proxied<T>>(initState);
  useWatch(() => {
    ref.current = initState;
  }, [initState]);
  return ref;
};

export { useRefFn, useRefSync };
