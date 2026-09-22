// Chapter 2: Utility Functions — vanilla replacements for lodash

export function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export function throttle(fn, limit) {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export const deepClone = (obj) => structuredClone(obj);

export function groupBy(arr, key) {
  return arr.reduce((acc, item) => {
    const group = typeof key === 'function' ? key(item) : item[key];
    (acc[group] ??= []).push(item);
    return acc;
  }, {});
}

export const pick = (obj, keys) =>
  Object.fromEntries(keys.filter(k => k in obj).map(k => [k, obj[k]]));

export const omit = (obj, keys) =>
  Object.fromEntries(Object.entries(obj).filter(([k]) => !keys.includes(k)));

export function chunk(arr, size) {
  return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size)
  );
}
