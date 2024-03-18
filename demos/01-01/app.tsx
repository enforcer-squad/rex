/* eslint-disable @typescript-eslint/no-unused-vars */
import { memo, type FC } from 'react';
import { useReactive, reactiveMemo } from '@/plugins/reactive';
import { Button } from 'antd';

interface PropTypes {
  person: { name: string; age: number };
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
  const [state, setState] = useReactive({ person: { name: 'xxx', age: 10 }, count: 0 });
  const { person } = state;
  console.log('render App');
  // setState(draft => (draft.person.name = 'yyy'));
  // console.log(state.person.name, state.person.age);
  // state.person.name = '123';
  return (
    <div>
      <Test1 person={person} />
      <Test2 person={person} />
      <Button
        type="primary"
        onClick={() => {
          setState(draft => (draft.person.name = 'yyy'));
        }}>
        change name
      </Button>
      <Button
        onClick={() => {
          setState(draft => (draft.person.age = 20));
        }}>
        change age
      </Button>
    </div>
  );
};

export default App;
