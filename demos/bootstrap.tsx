import ReactDOM from 'react-dom/client';
import './index.global.less';
import App from './app';

const container = document.getElementById('root')!;
const root = ReactDOM.createRoot(container);

root.render(<App />);
