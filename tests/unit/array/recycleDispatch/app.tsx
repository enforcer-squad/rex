import { useReactive } from '@/hooks/useReactive';
import { Button } from 'antd';
import { useState } from 'react';

const App = ({ renderTimeFn }: any) => {
  renderTimeFn();

  const [index, setIndex] = useState(0);
  const [state, setState] = useReactive({
    arr: [3, 2, 1],
  });

  return (
    <div>
      <div data-testid="value">{state.arr[index]}</div>
      <Button
        data-testid="btn1"
        onClick={() => {
          setState(draft => {
            draft.arr[0] = Math.random();
          });
        }}>
        change index 0 value
      </Button>
      <Button
        data-testid="btn2"
        onClick={() => {
          setIndex(1);
        }}>
        change index to 1
      </Button>
    </div>
  );
};

export default App;
