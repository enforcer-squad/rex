import { Menu } from 'antd';

const Menus = ({ cb }: { cb: any }) => {
  const items = [
    {
      label: '01',
      key: '01',
      children: [{ label: '01.测试01-01', key: '01-01' }],
    },
    {
      label: '02',
      key: '02',
      children: [{ label: '01.测试02-01', key: '02-01' }],
    },
  ];
  const clickHandler = ({ key }: { key: string }) => {
    cb(key);
  };
  return <Menu defaultOpenKeys={['01']} theme="dark" mode="inline" items={items} onClick={clickHandler} />;
};

export { Menus };
