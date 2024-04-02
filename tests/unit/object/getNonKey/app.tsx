import { useReactive } from '@/hooks/useReactive';
import { Button } from 'antd';

const App = ({ renderTimeFn }: any) => {
  renderTimeFn();

  const [state, setState] = useReactive({
    person: { name: 'xxx', age: 10 },
  });

  return (
    <div>
      <span data-testid="value">{(state as any).nonKey}</span>
      <Button
        data-testid="btn"
        onClick={() => {
          setState((draft: any) => (draft.nonKey = Math.random()));
        }}>
        add nonKey
      </Button>
    </div>
  );
};

export default App;
