/* eslint-disable @typescript-eslint/no-unused-vars */
import { fireEvent, render, screen } from '@testing-library/react';
import App from './app';

test('回收无效监听', () => {
  const renderTimeFn = jest.fn();

  render(<App renderTimeFn={renderTimeFn} />);

  const value = screen.getByTestId('value');
  const btn1 = screen.getByTestId('btn1');
  const btn2 = screen.getByTestId('btn2');

  expect(value.textContent).toBe('3');
  expect(renderTimeFn).toHaveBeenCalledTimes(1);

  fireEvent.click(btn1);
  // // 首先确保 value.textContent 是一个数值
  // const numericValue = parseFloat(value.textContent);
  // // 然后断言这个数值小于 1
  // expect(numericValue).toBeLessThan(1);
  expect(value.textContent).not.toBe('3');
  expect(renderTimeFn).toHaveBeenCalledTimes(2);

  fireEvent.click(btn2);
  expect(value.textContent).toBe('2');
  expect(renderTimeFn).toHaveBeenCalledTimes(3);

  fireEvent.click(btn1);
  expect(value.textContent).toBe('2');
  expect(renderTimeFn).toHaveBeenCalledTimes(3);
});
