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
      <div data-testid="value">
        {Object.keys(state).map(key => {
          return <p key={key}>{key}</p>;
        })}
      </div>
      <Button
        data-testid="btn1"
        onClick={() => {
          setState(draft => ((draft as any).newKey = Math.random()));
        }}>
        add key
      </Button>
      <Button
        data-testid="btn2"
        onClick={() => {
          setState(draft => delete (draft as any).count);
        }}>
        delete key
      </Button>
    </div>
  );
};

export default App;
