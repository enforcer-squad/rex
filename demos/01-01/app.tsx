/* eslint-disable @typescript-eslint/no-unused-vars */
import { memo, type FC, useState, useEffect } from 'react';
import { useReactive, reactiveMemo } from '@/plugins/reactive';
import { Button, Space } from 'antd';
import { toRaw } from '@/core';

interface PropTypes {
  person: { name: string; age: number };
  t?: any;
}

const Test1: FC<PropTypes> = reactiveMemo(({ person }) => {
  console.log('render Test1');
  return <div>{person.name}</div>;
});

const Test2: FC<PropTypes> = reactiveMemo(({ person }) => {
  console.log('render Test2');
  return <div>{person.age}</div>;
});

const App = () => {
  const [t, setT] = useState({ test: 111 });
  const [state, setState] = useReactive({
    person: { name: 'xxx', age: 10 },
    test: {
      a: {
        b: 1,
      },
    },
    count: 0,
  });

  // console.log(state.person.name);
  console.log(state.person);

  console.log(window.getPath(toRaw(state.test)));

  // useEffect(() => {
  //   console.log('effect', person.name);
  //   // console.log('effect');
  // }, [person]);

  // console.log('render App', person, window.pathsMap.get(toRaw(state)));
  return (
    <div style={{ padding: '10px' }}>
      {state.count}
      {/* <Test1 person={person} t={t} />
      <Test2 person={person} />
      <Space>
        <Button
          type="primary"
          onClick={() => {
            setState(draft => draft.count++);
          }}>
          Change Count
        </Button> */}
      <Button
        type="primary"
        onClick={() => {
          setState(draft => (draft.person.name = 'yyy'));
        }}>
        Change Name
      </Button>
      {/* <Button
          type="primary"
          onClick={() => {
            setState(draft => draft.person.age++);
          }}>
          Change Age
        </Button>
        <Button
          type="primary"
          onClick={() => {
            setState(draft => (draft.person = { name: 'zzz', age: 20 }));
          }}>
          Change Person
        </Button>
        <Button
          type="primary"
          onClick={() => {
            setT({ test: Math.random() });
          }}>
          setT
        </Button>
      </Space> */}
    </div>
  );
};

export default App;
