/* eslint-disable @typescript-eslint/require-array-sort-compare */
import { useReactive } from '@/hooks/useReactive';
import { Button } from 'antd';

const App = ({ renderTimeFn }: any) => {
  renderTimeFn();

  const [state, setState] = useReactive({
    arr: [3, 2, 1],
  });

  return (
    <div>
      <div data-testid="value">
        {state.arr.map((item, index) => {
          return <p key={index}>{item}</p>;
        })}
      </div>
      <Button
        data-testid="btn1"
        onClick={() => {
          setState(draft => draft.arr.push(Math.round(Math.random() * 10)));
        }}>
        push item
      </Button>
      <Button
        data-testid="btn2"
        onClick={() => {
          setState(draft => draft.arr.unshift(Math.round(Math.random() * 10)));
        }}>
        unshift item
      </Button>
      <Button
        data-testid="btn3"
        onClick={() => {
          setState(draft => draft.arr.pop());
        }}>
        pop item
      </Button>
      <Button
        data-testid="btn4"
        onClick={() => {
          setState(draft => draft.arr.shift());
        }}>
        shift item
      </Button>
      <Button
        data-testid="btn5"
        onClick={() => {
          setState(draft => draft.arr.splice(1, 1, 4));
        }}>
        splice item
      </Button>
      <Button
        data-testid="btn6"
        onClick={() => {
          setState(draft => draft.arr.sort());
        }}>
        sort items
      </Button>
      <Button
        data-testid="btn7"
        onClick={() => {
          setState(draft => draft.arr.reverse());
        }}>
        reverse items
      </Button>
    </div>
  );
};

export default App;
