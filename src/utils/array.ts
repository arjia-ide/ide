import {filter} from "lodash";

export function filterItems(items: any[]) {
  return filter(items, item => item !== null);
}

export function ifTrue<T>(condition: boolean, item: T): T {
  if (condition) {
    return item;
  } else {
    return null;
  }
}
