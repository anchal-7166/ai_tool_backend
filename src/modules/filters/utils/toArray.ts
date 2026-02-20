import { Transform } from 'class-transformer';

export const ToArray = () =>
  Transform(({ value }) => {
    if (!value) return undefined;
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      return value.split(',').map(v => v.trim()).filter(Boolean);
    }
    return undefined;
  });