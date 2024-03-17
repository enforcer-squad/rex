type TargetObj = Record<string, any>;

type Context = { value: any };

type Middleware = (context: Context, next: Middleware, ...args: any[]) => void;

type GetMiddleware<T extends TargetObj> = (context: Context, next: GetMiddleware<T>, target: T, p: keyof T, receiver: any) => void;
type SetMiddleware<T extends TargetObj> = (context: Context, next: SetMiddleware<T>, target: T, p: keyof T, newValue: any, receiver: any) => void;
type OwnKeysMiddleware<T extends TargetObj> = (context: Context, next: OwnKeysMiddleware<T>, target: T) => void;
type DeleteMiddleware<T extends TargetObj> = (context: Context, next: DeleteMiddleware<T>, target: T, p: keyof T) => void;
type ApplyMiddleware<T extends TargetObj> = (context: Context, next: ApplyMiddleware<T>, target: (...args: any[]) => any, thisArg: T | undefined, argArray: any[], rootProxyRef: T) => any;
type InitMiddleware<T extends TargetObj> = (context: Context, next: InitMiddleware<T>, target: T, handler: ProxyHandler<T>) => void;

interface CoreMiddleware<T extends TargetObj> {
  get?: GetMiddleware<T>;
  set?: SetMiddleware<T>;
  ownKeys?: OwnKeysMiddleware<T>;
  delete?: DeleteMiddleware<T>;
  apply?: ApplyMiddleware<T>;
  init?: InitMiddleware<T>;
}

type Handlers<T extends TargetObj> = {
  get: Array<GetMiddleware<T>>;
  set: Array<SetMiddleware<T>>;
  ownKeys: Array<OwnKeysMiddleware<T>>;
  delete: Array<DeleteMiddleware<T>>;
  apply: Array<ApplyMiddleware<T>>;
  init: Array<InitMiddleware<T>>;
};

type Proxied<T> = T & { __isRex: true };

const getBaseHandler = <T extends TargetObj>() => {
  const getMiddleware: GetMiddleware<T> = (context, next, target, prop, receiver) => {
    context.value = Reflect.get(target, prop, receiver);
  };
  const setMiddleware: SetMiddleware<T> = (context, next, target, prop, newValue, receiver) => {
    context.value = Reflect.set(target, prop, newValue, receiver);
  };
  const ownKeysMiddleware: OwnKeysMiddleware<T> = (context, next, target) => {
    context.value = Reflect.ownKeys(target);
  };
  const deleteMiddleware: DeleteMiddleware<T> = (context, next, target, prop) => {
    context.value = Reflect.deleteProperty(target, prop);
  };
  const applyMiddleware: ApplyMiddleware<T> = (context, next, target, thisArg, argArray, rootProxyRef) => {
    context.value = Reflect.apply(target, rootProxyRef, argArray);
  };
  const initMiddleware: InitMiddleware<T> = (context, next, target, handler) => {
    context.value = new Proxy(target, handler) as Proxied<T>;
  };

  return {
    get: [getMiddleware],
    set: [setMiddleware],
    ownKeys: [ownKeysMiddleware],
    delete: [deleteMiddleware],
    apply: [applyMiddleware],
    init: [initMiddleware],
  };
};

const execute = (middlewares: Middleware[], ...args: any[]) => {
  const work = (ctx: Context) => {
    function dispatch(index: number) {
      const fn = middlewares[index];
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

export type { TargetObj, Context, Middleware, GetMiddleware, SetMiddleware, OwnKeysMiddleware, DeleteMiddleware, ApplyMiddleware, InitMiddleware, CoreMiddleware, Handlers, Proxied };

export { getBaseHandler, execute };
