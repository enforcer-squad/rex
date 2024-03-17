const isFunction = (value: unknown): value is (...args: any[]) => any => typeof value === 'function';

const isObject = (value: unknown): value is object => typeof value === 'object' && value !== null;

const isSymbol = (value: unknown): value is symbol => typeof value === 'symbol';

export { isFunction, isObject, isSymbol };
