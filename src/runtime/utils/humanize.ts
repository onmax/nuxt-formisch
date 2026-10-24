import { splitByCase, upperFirst } from 'scule'

/** `user_name`, `userName` and `user-name` all become `User Name`. */
export function humanize(key: string): string {
  return splitByCase(key).map(upperFirst).join(' ')
}
