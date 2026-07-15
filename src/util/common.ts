import React from 'react';

export function wait(milliseconds: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

/**
 * ensure that the function passed to the first parameter is only called/executed once within the time passed as second parameter
 * @param fn function to be executed
 * @param ms time in milliseconds
 * @param scope the `this` value for the function
 */
export const debounce = <T extends React.Component>(fn: () => void, ms: number, scope: T) => {
  let timer: number | undefined;
  return () => {
    clearTimeout(timer);
    timer = window.setTimeout(() => {
      timer = undefined;
      fn.apply(scope);
    }, ms);
  };
};
