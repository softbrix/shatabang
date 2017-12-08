import { helper } from '@ember/component/helper';

export function multiply([a, b]) {
  return a * b;
}

export default helper(multiply);
