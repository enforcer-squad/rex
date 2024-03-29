/* eslint-disable @typescript-eslint/no-confusing-void-expression */
/* eslint-disable @typescript-eslint/require-array-sort-compare */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { memo, type FC, useState, useEffect } from 'react';
import { Button, Space } from 'antd';
import { reactiveMemo, useReactive } from '@/hooks/useReactive';
import { useComputed } from '@/hooks/useComputed';
import { useWatch } from '@/hooks/useWatch';
import { toRaw } from '@/core';
import { subscribe } from '@/plugins/subscribe';

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
  useWatch(() => {
    console.log('Test2', person.name);
  }, [person]);
  return <div>123</div>;
});

const App = () => {
  console.log('render App');

  const [t, setT] = useState({ test: 111 });
  const [state, setState] = useReactive({
    person: { name: 'xxx', age: 10 },
    test: {
      a: {
        b: 1,
      },
    },
    arr: [3, 2, 1],
    count: 0,
  });

  // console.log(Object.keys(state));
  //
  // setState(draft => {
  //   delete (draft as any).test;
  // });
  // const { person, test } = state;

  // console.log(state.person.name);

  // const computedResult = useComputed(() => person.name + test.a.b, [person, test]);

  // console.log(window.getPath(toRaw(state.test)));

  // useEffect(() => {
  //   console.log('effect', person.name);
  //   // console.log('effect');
  // }, [person]);

  // console.log('render App', person, window.pathsMap.get(toRaw(state)));
  return (
    <div style={{ padding: '10px' }}>
      {/* <div>测试用例 访问一个不存在的key 然后观察响应式能力</div>
      {(state as any).nonKey}
      <Button
        onClick={() => {
          setState(draft => ((draft as any).nonKey = Math.random()));
        }}>
        add nonKey
      </Button> */}
      {/* <div>测试用例 删除一个key 然后观察响应式能力</div>
      {(state as any).count}
      <Button
        onClick={() => {
          setState(draft => delete (draft as any).count);
        }}>
        delete count
      </Button> */}
      {/* <div>测试用例 使用object.keys收集依赖，观察key增加减少之后的响应式能力</div>
      {Object.keys(state).map(key => {
        return <p key={key}>{key}</p>;
      })}
      <Button
        onClick={() => {
          setState(draft => ((draft as any).newKey = Math.random()));
        }}>
        add key
      </Button>
      <Button
        onClick={() => {
          setState(draft => delete (draft as any).count);
        }}>
        delete key
      </Button> */}
      {/* <div>测试用例 使用object.values 观察key增加减少之后的响应式能力</div>
      {Object.values(state).map((v, index) => {
        return <p key={index}>{index}</p>;
      })}
      <Button
        onClick={() => {
          setState(draft => ((draft as any).newKey = Math.random()));
        }}>
        add key
      </Button>
      <Button
        onClick={() => {
          setState(draft => delete (draft as any).count);
        }}>
        delete key
      </Button> */}
      <div>测试用例 map数组 增加减少元素 然后观察响应式能力</div>
      {state.arr.map((item, index) => {
        return <p key={index}>{item}</p>;
      })}
      <Button
        onClick={() => {
          setState(draft => draft.arr.push(Math.round(Math.random() * 10)));
        }}>
        push item
      </Button>
      <Button
        onClick={() => {
          setState(draft => draft.arr.unshift(Math.round(Math.random() * 10)));
        }}>
        unshift item
      </Button>
      <Button
        onClick={() => {
          setState(draft => draft.arr.pop());
        }}>
        pop item
      </Button>
      <Button
        onClick={() => {
          setState(draft => draft.arr.shift());
        }}>
        shift item
      </Button>
      <Button
        onClick={() => {
          setState(draft => draft.arr.splice(1, 1, 4));
        }}>
        splice item
      </Button>
      <Button
        onClick={() => {
          setState(draft => draft.arr.sort());
        }}>
        sort items
      </Button>
      <Button
        onClick={() => {
          setState(draft => draft.arr.reverse());
        }}>
        reverse items
      </Button>
      {/* {state.count} */}
      {/* {computedResult} */}
      {/* <Test1 person={person} t={t} /> */}
      {/* <Test2 person={person} /> */}
      {/* <Space> */}
      {/* <Button
        type="primary"
        onClick={() => {
          setState(draft => draft.count++);
        }}>
        Change Count
      </Button>
      <Button
        type="primary"
        onClick={() => {
          setState(draft => (draft.person.name = 'yyy'));
        }}>
        Change Name
      </Button>
      <Button
        type="primary"
        onClick={() => {
          setState(draft => (draft.test.a.b = Math.random()));
        }}>
        Change test
      </Button> */}
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
