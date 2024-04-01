/* eslint-disable @typescript-eslint/no-unused-vars */
import { fireEvent, render, screen } from '@testing-library/react';
import App from './app';

test('map数组 增加减少元素 然后观察响应式能力', () => {
  const renderTimeFn = jest.fn();

  render(<App renderTimeFn={renderTimeFn} />);
  expect(renderTimeFn).toHaveBeenCalledTimes(1);

  const value = screen.getByTestId('value');
  const btn1 = screen.getByTestId('btn1');
  const btn2 = screen.getByTestId('btn2');
  const btn3 = screen.getByTestId('btn3');
  const btn4 = screen.getByTestId('btn4');
  const btn5 = screen.getByTestId('btn5');
  const btn6 = screen.getByTestId('btn6');
  const btn7 = screen.getByTestId('btn7');
  expect(value.querySelectorAll('p').length).toBe(3);

  fireEvent.click(btn1);
  expect(value.querySelectorAll('p').length).toBe(4);
  expect(renderTimeFn).toHaveBeenCalledTimes(2);

  fireEvent.click(btn2);
  expect(value.querySelectorAll('p').length).toBe(5);
  expect(renderTimeFn).toHaveBeenCalledTimes(3);

  fireEvent.click(btn3);
  expect(value.querySelectorAll('p').length).toBe(4);
  expect(renderTimeFn).toHaveBeenCalledTimes(4);

  fireEvent.click(btn4);
  expect(value.querySelectorAll('p').length).toBe(3);
  expect(renderTimeFn).toHaveBeenCalledTimes(5);

  fireEvent.click(btn5);
  expect(value.querySelectorAll('p')[1].textContent).toBe('4');
  expect(renderTimeFn).toHaveBeenCalledTimes(6);

  fireEvent.click(btn6);
  expect(value.querySelectorAll('p')[0].textContent).toBe('1');
  expect(renderTimeFn).toHaveBeenCalledTimes(7);

  fireEvent.click(btn7);
  expect(value.querySelectorAll('p')[0].textContent).toBe('4');
  expect(renderTimeFn).toHaveBeenCalledTimes(8);
});
