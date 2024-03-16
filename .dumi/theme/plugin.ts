// @ts-nocheck
import { IApi } from '@umijs/types';
import { resolve } from 'path';
import { readFileSync } from 'fs';

export default (api: IApi) => {
  api.onGenerateFiles(() => {
    const path_tb =
      api.env === 'production'
        ? './.dumi/tmp-production/testBrowser.tsx'
        : './.dumi/tmp/testBrowser.tsx';
    const TBBuffer = readFileSync(resolve(path_tb));
    const TBContent = String(TBBuffer);

    const path_umi =
      api.env === 'production'
        ? './.dumi/tmp-production/umi.ts'
        : './.dumi/tmp/umi.ts';
    const umiBuffer = readFileSync(resolve(path_umi));
    const umiContent = String(umiBuffer);

    api.writeTmpFile({
      path: '../bootstrap_tb.tsx',
      content: TBContent,
    });
    api.writeTmpFile({
      path: '../testBrowser.tsx',
      content: 'import("./bootstrap_tb")',
    });

    api.writeTmpFile({
      path: '../bootstrap_umi.tsx',
      content: umiContent,
    });
    api.writeTmpFile({
      path: '../umi.ts',
      content: 'import("./bootstrap_umi.tsx")',
    });
  });
};
