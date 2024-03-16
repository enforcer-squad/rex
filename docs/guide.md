# 指南

业务组件库是一套高质量、高性能、高可复用的业务组件集合，旨在提升开发效率和用户体验。

## 安装

你可以使用 npm 或 yarn 来安装业务组件库：

```bash

xxxxx

```

## 引入

你可以按需引入你需要的业务组件，例如：

```tsx | pure


import { sum } from 'tpl-lib-ts';

import React from 'react';

const App: React.FC = () => {
   const result = sum(1, 4);

  return <div>{result}</div>;
};

export default App;
```

## 常见问题

```bash
Error: Shared module is not available for eager consumption

```

解决方案见此[链接](https://www.webpackjs.com/concepts/module-federation/#Uncaught-Error-Shared-module-is-not-available-for-eager-consumption)
