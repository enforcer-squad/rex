/* eslint-disable @typescript-eslint/no-unused-vars */
import { fireEvent, render, screen } from '@testing-library/react';
import App from './app';

test('访问一个不存在的key 然后观察响应式能力', () => {
  const renderTimeFn = jest.fn();

  render(<App renderTimeFn={renderTimeFn} />);
  expect(renderTimeFn).toHaveBeenCalledTimes(1);

  const spanElement = screen.getByTestId('value');
  expect(spanElement.textContent).toBe('');

  fireEvent.click(screen.getByTestId('btn'));
  // fireEvent.click(screen.getByText(/add nonKey/i));
  expect(spanElement.textContent).toBeTruthy();
  expect(renderTimeFn).toHaveBeenCalledTimes(2);
});
