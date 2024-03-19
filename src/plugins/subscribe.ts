/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-unused-vars */
import type Core from '@/core';
import { getCoreInstance, isRex, toRaw } from '@/core';
import type { TargetObj, IPlugin, Proxied } from '@/core/plugins';
import { isObject } from '@/utils/tools';
import { type FunctionComponent, memo, useCallback, useLayoutEffect, useMemo, useReducer, useRef, useEffect } from 'react';

type GetPath<T extends TargetObj> = (target: T, prop?: keyof T) => string;

class SubscribePlugin<T extends TargetObj> implements IPlugin<T> {
  core: Core<T> | undefined;
  pathsMap = new WeakMap<T, string>();
  setup(core: Core<T>) {
    window.pathsMap = this.pathsMap;
    this.core = core;
    window.getPath = this.getPath;
  }

  private readonly getPath: GetPath<T> = (target, prop) => {
    const parentPath = this.pathsMap.get(target) || this.core!.getterIdMap.get(target);
    if (parentPath) {
      let path = parentPath;
      if (prop !== undefined) {
        path += `.${prop as string}`;
      }
      return path;
    }
    console.log('没有path');
    return '';
    const currentPath = parentPath ? `${parentPath}.${prop as string}` : prop;
    return currentPath as string;
  };

  get: IPlugin<T>['get'] = (context, next, target, prop, receiver) => {
    next(context, next, target, prop, receiver);

    if (isObject(context.value)) {
      // console.log(target, prop);
      const parentPath = this.getPath(target);
      this.pathsMap.set(target[prop], `${parentPath}.${prop as string}`);
    }
  };

  set: IPlugin<T>['set'] = (context, next, target, prop, newValue, receiver) => {
    next(context, next, target, prop, newValue, receiver);
    const currentPath = this.getPath(target, prop);
    console.log('set', currentPath);
  };
}

export { SubscribePlugin };
