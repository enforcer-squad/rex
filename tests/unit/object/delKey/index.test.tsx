/* eslint-disable @typescript-eslint/no-unused-vars */
import { fireEvent, render, screen } from '@testing-library/react';
import App from './app';

test('删除一个key 然后观察响应式能力', () => {
  const renderTimeFn = jest.fn();

  render(<App renderTimeFn={renderTimeFn} />);
  expect(renderTimeFn).toHaveBeenCalledTimes(1);

  const value = screen.getByTestId('value');
  const btn = screen.getByTestId('btn');
  expect(value.textContent).toBe('0');

  fireEvent.click(btn);
  expect(value.textContent).toBe('');
  expect(renderTimeFn).toHaveBeenCalledTimes(2);
});
