import type Core from '@/core';
import { getCoreInstance, toRaw } from '@/core';
import { type Proxied, type IPlugin, type TargetObj } from '@/core/plugins';

type DevToolOptions = {
  name?: string;
  interceptor?: <T extends TargetObj>(model: T) => T;
};

class DevToolPlugin<T extends TargetObj> implements IPlugin<T> {
  core: Core<T> | undefined;
  devTools: any;
  options: DevToolOptions;

  constructor(devTools: any, options: DevToolOptions = {}) {
    this.devTools = devTools;
    this.options = options;
  }

  setup(core: Core<T>) {
    this.core = core;
  }

  apply: IPlugin<T>['apply'] = (context, next, target, thisArg, argArray, state) => {
    next(context, next, target, thisArg, argArray, state);
    const { interceptor } = this.options;

    if (interceptor) {
      state = interceptor(state);
    }

    this.devTools.send(`${target.name.replace('bound ', '')}`, state);
  };
}

declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION__: any;
  }
}

const devtools = <T extends TargetObj>(model: Proxied<T>, options: DevToolOptions = {}) => {
  if (window.__REDUX_DEVTOOLS_EXTENSION__ === undefined) return;
  const core = getCoreInstance(model);
  const state = toRaw(model);
  const { name = 'anonymous' } = options;
  const devTool = window.__REDUX_DEVTOOLS_EXTENSION__.connect({ name });
  devTool.init(state);
  const devToolPlugin = new DevToolPlugin<T>(devTool, options);
  core.use(devToolPlugin);
};

export { DevToolPlugin, devtools };
