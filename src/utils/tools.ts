const isFunction = (value: unknown): value is (...args: any[]) => any => typeof value === 'function';

const isObject = (value: unknown): value is object => typeof value === 'object' && value !== null;

const isSymbol = (value: unknown): value is symbol => typeof value === 'symbol';

const isPrimitive = (value: any) => {
  return (typeof value !== 'object' && typeof value !== 'function') || value === null;
};

export { isFunction, isObject, isSymbol, isPrimitive };
