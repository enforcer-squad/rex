import { useRef, useState } from 'react';

const useRefEx = (initialState: any) => {
  const [init] = useState(initialState);
  const ref = useRef(init);
  return ref;
};

export default useRefEx;
