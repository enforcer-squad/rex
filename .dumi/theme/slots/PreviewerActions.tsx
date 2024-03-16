// @ts-nocheck
import React from 'react';
import DumiPreviewerActions from 'dumi/theme-default/slots/PreviewerActions';

const PreviewerActions = (props: any) => {
  const config = {
    ...props,
    // disabledActions: ['CSB', 'CODEPEN', 'STACKBLITZ'],
  };
  return <DumiPreviewerActions {...config} />;
};

export default PreviewerActions;
