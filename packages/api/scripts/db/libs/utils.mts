import { ConfigValue } from '../../config.mts';

export function replacePlaceholders(sql: string, values: ConfigValue) {
  let result = sql;

  for (const [placeholder, value] of Object.entries(values)) {
    result = result.replace(new RegExp(`":${placeholder}"`, 'g'), String(value));
  }
  return result;
}
