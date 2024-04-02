import { useReactive } from '@/hooks/useReactive';
import { Button } from 'antd';

const App = ({ renderTimeFn }: any) => {
  renderTimeFn();

  const [state, setState] = useReactive({
    person: { name: 'xxx', age: 10 },
    count: 0,
  });

  return (
    <div>
      <span data-testid="value">{state.count}</span>
      <Button
        data-testid="btn"
        onClick={() => {
          setState(draft => delete (draft as any).count);
        }}>
        delete count
      </Button>
    </div>
  );
};

export default App;
