/* eslint-disable @typescript-eslint/no-unused-vars */
import type Core from '@/core';
import { getCoreInstance, isRex, toRaw } from '@/core';
import type { TargetObj, IPlugin, Proxied, DispatchFn } from '@/core/plugins';
import { isObject } from '@/utils/tools';
import { type FunctionComponent, memo, useCallback, useLayoutEffect, useMemo, useReducer, useRef, useEffect } from 'react';

type GetPath<T extends TargetObj> = (target: T, prop?: keyof T) => string;

const __ROOT__ = '__ROOT__';
class SubscribePlugin<T extends TargetObj> implements IPlugin<T> {
  core: Core<T> | undefined;
  pathsMap = new WeakMap<T, string>();
  listenersMap = new Map<string, Set<DispatchFn>>();

  setup(core: Core<T>) {
    this.core = core;
  }

  private readonly isMatch = (target: string, current: string) => {
    const targetParts = target.split('.');
    const currentParts = current.split('.');

    for (let i = 0; i < targetParts.length; i++) {
      if (currentParts[i] === undefined) {
        return true;
      }
      if (targetParts[i] !== currentParts[i]) {
        return false;
      }
    }
    return true;
  };

  private readonly getPath: GetPath<T> = (target, prop) => {
    const parentPath = this.pathsMap.get(target);
    let path = '';
    if (parentPath) {
      path += parentPath;
    }
    if (prop !== undefined) {
      path += parentPath ? `.${prop as string}` : `${prop as string}`;
    }
    return path;

    // const currentPath = parentPath ? `${parentPath}.${prop as string}` : prop;
    // return currentPath as string;
  };

  get: IPlugin<T>['get'] = (context, next, target, prop, receiver) => {
    next(context, next, target, prop, receiver);

    if (isObject(context.value)) {
      const parentPath = this.getPath(target);
      const path = parentPath ? `${parentPath}.${prop as string}` : `${prop as string}`;
      // console.log('getPath', path);
      this.pathsMap.set(target[prop], path);
    }
  };

  set: IPlugin<T>['set'] = (context, next, target, prop, newValue, receiver) => {
    next(context, next, target, prop, newValue, receiver);
    const currentPath = this.getPath(target, prop);
    console.log('currentPath', currentPath, 'set', target, prop);

    if (currentPath) {
      const matchingKeys = Array.from(this.listenersMap.keys()).filter(key => key === __ROOT__ || this.isMatch(key, currentPath));
      matchingKeys.forEach(matchKey => {
        this.listenersMap.get(matchKey)?.forEach(cb => {
          cb();
        });
      });
    }
  };
}

const subscribe = <T extends TargetObj>(proxyTarget: Proxied<T>, callback: (...args: any[]) => void, lazy: boolean = true) => {
  const core = getCoreInstance(proxyTarget);
  const subscribePlugin = core.getPlugin(SubscribePlugin);
  const target = toRaw(proxyTarget);
  let subscribePath = subscribePlugin.getPath(target);
  if (!subscribePath && isRex(proxyTarget)) {
    subscribePath = __ROOT__;
  }
  console.log('subscribePath', subscribePath);

  if (subscribePath) {
    const pathListeners = subscribePlugin.listenersMap.get(subscribePath) || new Set<DispatchFn>();

    pathListeners.add(callback);
    subscribePlugin.listenersMap.set(subscribePath, pathListeners);
    if (!lazy) {
      callback();
    }
    return () => {
      const pathListeners = subscribePlugin.listenersMap.get(subscribePath);
      if (pathListeners) {
        pathListeners.delete(callback);
      }
    };
  }
  return () => undefined;
};

export { subscribe, SubscribePlugin };
