/* eslint-disable @typescript-eslint/no-unused-vars */
import { fireEvent, render, screen } from '@testing-library/react';
import App from './app';

test('使用object.keys收集依赖 观察key增加减少之后的响应式能力', () => {
  const renderTimeFn = jest.fn();

  render(<App renderTimeFn={renderTimeFn} />);
  expect(renderTimeFn).toHaveBeenCalledTimes(1);

  const value = screen.getByTestId('value');
  const btn1 = screen.getByTestId('btn1');
  const btn2 = screen.getByTestId('btn2');
  expect(value.querySelectorAll('p').length).toBe(2);

  fireEvent.click(btn1);
  expect(value.querySelectorAll('p').length).toBe(3);
  expect(renderTimeFn).toHaveBeenCalledTimes(2);

  fireEvent.click(btn2);
  expect(value.querySelectorAll('p').length).toBe(2);
  expect(renderTimeFn).toHaveBeenCalledTimes(3);
});
