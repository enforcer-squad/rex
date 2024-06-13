/* eslint-disable @typescript-eslint/no-confusing-void-expression */
/* eslint-disable @typescript-eslint/require-array-sort-compare */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { memo, type FC, useState, useEffect } from 'react';
import { Button, Space } from 'antd';
import { createModel, useModel, devtools, reactiveMemo, useReactive, useComputed, useWatch, toRaw, subscribe } from '@/index';

interface PropTypes {
  // person: { name: string; age: number };
  arr: number[];
  index: number;
}

interface PropTypes1 {
  person: { name: string; age: number };
}
interface PropTypes2 {
  name?: string;
  age?: number;
}
interface PropTypes3 {
  arr?: number[];
  index?: number;
  value?: number;
}

const Test1: FC<PropTypes> = reactiveMemo(({ arr, index }) => {
  console.log('render Test1', arr[index]);
  // return <div>I am test1 {person?.name}</div>;
  return <div>I am test1</div>;
});

const Test2: FC<PropTypes1> = reactiveMemo(({ person }) => {
  const [count, setCount] = useReactive(0);
  // const [a, setA] = useReactive({ a: 1 });
  console.log('render Test2');
  const computedResult = useComputed(() => person.age + count?.value, [person, count]);
  // const computedResult = useComputed(() => person.age + count?.value, [person, count?.value]);
  console.log('computedResult', computedResult);

  // useWatch(() => {
  //   console.log('Test2', person.age);
  // }, [person, count?.value]);

  return (
    <div>
      <div>I am test2</div>
      <Button onClick={() => setCount(10)}>sub count1</Button>
      <Button onClick={() => setCount(d => d.value++)}>sub count2</Button>
      <Button onClick={() => setCount(undefined)}>sub count3</Button>
      {/* <Button onClick={() => setA({ a: 2 })}>sub count2</Button>
      <Button onClick={() => setA(d => d.a++)}>sub count3</Button> */}
    </div>
  );
});

const Test3: FC<PropTypes2> = reactiveMemo(({ name }) => {
  console.log('render Test3');
  // return <div>I am test1 {person?.name}</div>;
  return <div>I am test3,{name}</div>;
});

const Test4: FC<PropTypes2> = reactiveMemo(({ age }) => {
  console.log('render Test4');
  // return <div>I am test1 {person?.name}</div>;
  return <div>I am test4,{age}</div>;
});

const Test5: FC<PropTypes3> = reactiveMemo(({ value }) => {
  console.log('render Test5');
  // return <div>I am test1 {person?.name}</div>;
  return <div>I am test5,{value}</div>;
});

const state = createModel({
  person: {
    name: 'xxx',
    age: 10,
  },
  arr: [1, 2, 3],
  index: 0,
  setName(name: string) {
    state.person.name = name;
  },
  increaseAge() {
    state.person.age++;
  },
  setIndex(index: number) {
    state.index = index;
  },
  updateItem(index: number, value: number) {
    state.arr[index] = value;
  },
  mixFn() {
    state.setName('mixFn');
    state.increaseAge();
  },
  async getData() {
    const name: string = await new Promise(resolve => {
      setTimeout(() => {
        resolve('async getData');
      }, 1000);
    });
    state.setName(name);
  },
});
devtools(state, { name: 'app' });
const App = () => {
  console.log('render App');
  const [count, setCount] = useState('1');
  const aaa = () => {
    setCount('2');
  };
  const {
    person: { name, age },
    arr,
    index,
    setName,
    increaseAge,
    setIndex,
    updateItem,
    mixFn,
    getData,
  } = useModel(state);
  // const [index, setIndex] = useReactive(0);
  // const [state, setState] = useReactive({
  //   person: { name: 'xxx', age: 10 },
  //   nested: {
  //     person: {
  //       name: 'xxx',
  //       age: 10,
  //     },
  //   },
  //   test: {
  //     a: {
  //       b: 1,
  //     },
  //   },
  //   arr: [3, 2, 1],
  //   count: 0,
  // });

  // const {
  //   nested: { person: nestedPerson },
  //   person,
  //   arr,
  // } = state;
  // useEffect(() => {
  //   subscribe(state, () => {
  //     console.log('state changed');
  //   });
  // }, []);

  // const [state, setState] = useReactive();
  // const [state, setState] = useReactive(12);
  // const [any, setAny] = useReactive(null);
  // console.log(any);

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
      <div onClick={aaa}>rrrrr{count}</div>
      {/* <div>{name}</div> */}
      <Test3 name={name} />
      <Test4 age={age} />
      {/* <Test5 arr={arr} index={index} /> */}
      <Test5 value={arr[index]} />
      <Button
        onClick={() => {
          setName('qqq');
        }}>
        setName
      </Button>
      <Button
        onClick={() => {
          increaseAge();
        }}>
        increaseAge
      </Button>
      <Button
        onClick={() => {
          setIndex(1);
        }}>
        setIndex 1
      </Button>
      <Button
        onClick={() => {
          updateItem(0, Math.random());
        }}>
        update arr 0
      </Button>
      <Button
        onClick={() => {
          mixFn();
        }}>
        mixFn
      </Button>
      <Button
        onClick={() => {
          getData();
        }}>
        async getData
      </Button>
      {/* <div>{state?.person?.name}</div> */}
      {/* <div>{state?.person?.age}</div> */}
      {/* <div>{state?.count}</div> */}
      {/* <div>{state?.value}</div> */}
      {/* <Test1 arr={arr} index={index.value} /> */}
      {/* <Test2 person={nestedPerson} /> */}
      {/* <Button
        onClick={() => {
          setIndex(0);
        }}>
        set index 0
      </Button>
      <Button
        onClick={() => {
          setIndex(1);
        }}>
        set index 1
      </Button>
      <Button
        onClick={() => {
          setState(d => (d.arr[0] = Math.random()));
        }}>
        index 0
      </Button>
      <Button
        onClick={() => {
          setState(d => (d.arr[1] = Math.random()));
        }}>
        index 1
      </Button>
      <Button
        onClick={() => {
          setState(undefined);
          // setState({ count: 123 } as any);
          // setState(draft => draft.count++);
          // setState({
          //   person: { name: 'xxx', age: 10 },
          //   test: {
          //     a: {
          //       b: 1,
          //     },
          //   },
          //   arr: [3, 2, 1],
          //   count: 0,
          // });
        }}>
        add count
      </Button>
      <Button
        onClick={() => {
          // setState(12);
          setState({
            person: { name: 'xxx', age: 10 },
            nested: {
              person: {
                name: 'xxx',
                age: 10,
              },
            },
            test: {
              a: {
                b: 1,
              },
            },
            arr: [3, 2, 1],
            count: 0,
          });
        }}>
        add count 12
      </Button>
      <Button
        type="primary"
        onClick={() => {
          setState(draft => (draft.person.name = 'yyy'));
          // setState(draft => (draft.nested.person.name = 'nested yyy'));
        }}>
        Change Name
      </Button>
      <Button
        type="primary"
        onClick={() => {
          // setState(draft => draft.person.age++);
          setState(draft => draft.nested.person.age++);
          // setState(draft => draft.count++);
        }}>
        Change Age
      </Button> */}
      {/* <div>{state.arr[index]}</div>
      <Button
        onClick={() => {
          setState(draft => {
            draft.arr[0] = Math.random();
          });
        }}>
        change index 0 value
      </Button>
      <Button
        onClick={() => {
          setIndex(1);
        }}>
        change index to 1
      </Button> */}
      {/* <div>测试用例 访问一个不存在的key 然后观察响应式能力</div>
      <span>{(state as any).nonKey}</span>
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
      {/* <div>测试用例 map数组 增加减少元素 然后观察响应式能力</div>
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
      </Button> */}
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

const App1 = () => {
  const [person, setPerson] = useReactive(() => {
    return {
      name: 'xxx',
      age: 10,
    };
  });
  console.log('person', person);

  return (
    <div>
      <div data-testid="value">{person.name}</div>
      <div data-testid="value">{person.age}</div>

      <Button
        data-testid="btn2"
        onClick={() => {
          setPerson(draft => {
            draft.name = 'yyy';
          });
        }}>
        Set Name
      </Button>
      <Button
        data-testid="btn2"
        onClick={() => {
          setPerson(draft => {
            draft.age++;
          });
        }}>
        Set Age
      </Button>
      <Button
        data-testid="btn2"
        onClick={() => {
          setPerson({ name: 'xxx', age: 10 });
        }}>
        Reset Person
      </Button>
    </div>
  );
};

export default App1;
