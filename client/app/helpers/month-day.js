import { helper } from '@ember/component/helper';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Okt','Nov','Dec'];

export function monthDay([date]/*, hash*/) {
  return date.getDate() + " " + MONTHS[date.getMonth()];
}

export default helper(monthDay);
