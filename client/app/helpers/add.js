import { helper } from '@ember/component/helper';

export function add([a, b]) {
  return a + b;
}

export default helper(add);
