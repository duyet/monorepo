export const range = (start: number, end: number) => {
  const output = [];
  let _start = start;
  let _end = end;

  if (typeof end === 'undefined') {
    _end = start;
    _start = 0;
  }

  for (let i = _start; i < _end; i += 1) {
    output.push(i);
  }

  return output;
};
