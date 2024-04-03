/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-unused-vars */
import type Core from '@/core';
import { getCoreInstance, isRex, toRaw } from '@/core';
import type { TargetObj, IPlugin, Proxied, DispatchFn } from '@/core/plugins';
import { isObject } from '@/utils/tools';
import { type FunctionComponent, memo, useCallback, useLayoutEffect, useMemo, useReducer, useRef, useEffect } from 'react';

type GetPath<T extends TargetObj> = (receiver: Proxied<T>, target?: T, prop?: keyof T) => string;

class SubscribePlugin<T extends TargetObj> implements IPlugin<T> {
  core: Core<T> | undefined;
  pathsMap = new WeakMap<T, string>();
  listenersMap = new Map<string, Set<DispatchFn>>();

  setup(core: Core<T>) {
    this.core = core;
  }

  private readonly getPath: GetPath<T> = (receiver, target, prop) => {
    const parentPath = (target && this.pathsMap.get(target)) || this.core!.getterIdMap.get(receiver);
    if (parentPath) {
      let path = parentPath;
      if (prop !== undefined) {
        path += `.${prop as string}`;
      }
      return path;
    }
    console.log('没有path');
    return '';
    // const currentPath = parentPath ? `${parentPath}.${prop as string}` : prop;
    // return currentPath as string;
  };

  get: IPlugin<T>['get'] = (context, next, target, prop, receiver) => {
    next(context, next, target, prop, receiver);
    console.log(target[prop], receiver);

    if (isObject(context.value)) {
      const parentPath = this.getPath(receiver, target);
      console.log('getPath', `${parentPath}.${prop as string}`, target, prop);
      this.pathsMap.set(target[prop], `${parentPath}.${prop as string}`);
    }
  };

  set: IPlugin<T>['set'] = (context, next, target, prop, newValue, receiver) => {
    next(context, next, target, prop, newValue, receiver);
    const currentPath = this.getPath(receiver, target, prop);
    console.log(currentPath, 'set', target, prop);

    if (currentPath) {
      const matchingKeys = Array.from(this.listenersMap.keys()).filter(key => currentPath.includes(key));
      matchingKeys.forEach(matchKey => {
        this.listenersMap.get(matchKey)?.forEach(cb => {
          cb();
        });
      });
    }
  };
}

const subscribe = <T extends TargetObj>(proxyTarget: Proxied<T>, callback: (...args: any[]) => void) => {
  const core = getCoreInstance(proxyTarget);
  const subscribePlugin = core.getPlugin(SubscribePlugin);
  const subscribePath = subscribePlugin.getPath(proxyTarget);
  console.log('subscribePath', subscribePath);

  if (subscribePath) {
    const pathListeners = subscribePlugin.listenersMap.get(subscribePath) || new Set<DispatchFn>();
    pathListeners.add(callback);
    subscribePlugin.listenersMap.set(subscribePath, pathListeners);
  }
};

export { subscribe, SubscribePlugin };
