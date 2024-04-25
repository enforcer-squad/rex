import type { Core } from '.';

type PrimitiveType = string | number | boolean;

type FunctionType = (...args: any[]) => any;

type TargetObj = Record<string, any>;

type Context = { value: any };

type Proxied<T> = {
  [P in keyof T]: T[P] extends object ? (T[P] extends (...args: any[]) => any ? T[P] : Proxied<T[P]>) : T[P];
};

type DispatchFn = (...args: any[]) => void;

type Handler = (context: Context, next: Handler, ...args: any[]) => void;

type GetHandler<T extends TargetObj> = (context: Context, next: GetHandler<T>, target: T, p: keyof T, receiver: any) => void;
type SetHandler<T extends TargetObj> = (context: Context, next: SetHandler<T>, target: T, p: keyof T, newValue: any, receiver: any) => void;
type OwnKeysHandler<T extends TargetObj> = (context: Context, next: OwnKeysHandler<T>, target: T, receiver: any) => void;
type DeleteHandler<T extends TargetObj> = (context: Context, next: DeleteHandler<T>, target: T, p: keyof T) => void;
type ApplyHandler<T extends TargetObj> = (context: Context, next: ApplyHandler<T>, target: (...args: any[]) => any, thisArg: T | undefined, argArray: any[], rootProxyRef: T) => any;
type InitHandler<T extends TargetObj> = (context: Context, next: InitHandler<T>, target: T, handler: ProxyHandler<T>) => void;

interface IPlugin<T extends TargetObj> {
  setup: (core: Core<T>) => void;
  get?: GetHandler<T>;
  set?: SetHandler<T>;
  ownKeys?: OwnKeysHandler<T>;
  delete?: DeleteHandler<T>;
  apply?: ApplyHandler<T>;
  init?: InitHandler<T>;
}

type Handlers<T extends TargetObj> = {
  get: Array<GetHandler<T>>;
  set: Array<SetHandler<T>>;
  ownKeys: Array<OwnKeysHandler<T>>;
  delete: Array<DeleteHandler<T>>;
  apply: Array<ApplyHandler<T>>;
  init: Array<InitHandler<T>>;
};

const getBaseHandler = <T extends TargetObj>() => {
  const getHandler: GetHandler<T> = (context, next, target, prop, receiver) => {
    context.value = Reflect.get(target, prop, receiver);
  };
  const setHandler: SetHandler<T> = (context, next, target, prop, newValue, receiver) => {
    context.value = Reflect.set(target, prop, newValue, receiver);
  };
  const ownKeysHandler: OwnKeysHandler<T> = (context, next, target) => {
    context.value = Reflect.ownKeys(target);
  };
  const deleteHandler: DeleteHandler<T> = (context, next, target, prop) => {
    context.value = Reflect.deleteProperty(target, prop);
  };
  const applyHandler: ApplyHandler<T> = (context, next, target, thisArg, argArray, rootProxyRef) => {
    context.value = Reflect.apply(target, rootProxyRef, argArray);
  };
  const initHandler: InitHandler<T> = (context, next, target, handler) => {
    context.value = new Proxy(target, handler) as Proxied<T>;
  };

  return {
    get: [getHandler],
    set: [setHandler],
    ownKeys: [ownKeysHandler],
    delete: [deleteHandler],
    apply: [applyHandler],
    init: [initHandler],
  };
};

const execute = (handlers: Handler[], ...args: any[]) => {
  const work = (ctx: Context) => {
    function dispatch(index: number) {
      const fn = handlers[index];
      if (fn) {
        fn(
          ctx,
          () => {
            dispatch(index + 1);
          },
          ...args,
        );
      }
    }
    dispatch(0);
  };
  const context: Context = { value: null };
  work(context);
  return context;
};

// type HandlerFunction<T extends TargetObj, K extends keyof Handlers<T>> = Handlers<T>[K] extends Array<infer M> ? M[] : never;

// function filterHandler<T extends TargetObj, K extends keyof Handlers<T>>(middlewares: HandlerFunction<T, K>, middleware: HandlerFunction<T, K>[number]): HandlerFunction<T, K> {
//   return middlewares.filter(fn => fn !== middleware) as HandlerFunction<T, K>;
// }

export type { PrimitiveType, FunctionType, TargetObj, Context, Handler, GetHandler, SetHandler, OwnKeysHandler, DeleteHandler, ApplyHandler, InitHandler, IPlugin, Handlers, Proxied, DispatchFn };

export { getBaseHandler, execute };
