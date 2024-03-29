const isFunction = (value: unknown): value is (...args: any[]) => any => typeof value === 'function';

const isObject = (value: unknown): value is object => typeof value === 'object' && value !== null;

const isSymbol = (value: unknown): value is symbol => typeof value === 'symbol';

const isPrimitive = (value: any) => {
  return (typeof value !== 'object' && typeof value !== 'function') || value === null;
};

const isFunctionProp = (target: any, prop: any): boolean => {
  return isFunction(Reflect.get(target, prop));
};

const ArrayTraverseMethods = ['indexOf', 'include', 'forEach', 'keys', 'values', 'entries', 'map', 'filter', 'reduce', 'reduceRight', 'find', 'findIndex', 'some', 'every', 'sort', 'reverse'];

const isArrayTraverse = (target: any, prop: any): boolean => {
  if (Array.isArray(target) && ArrayTraverseMethods.includes(prop) && Array.prototype[prop] === Reflect.get(target, prop)) {
    return true;
  }
  return false;
};

export { isFunction, isObject, isSymbol, isPrimitive, isFunctionProp, isArrayTraverse };
