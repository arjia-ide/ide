

export function Try(func, onError = null) {
  try {
    return func();
  } catch (e) {

    if (!onError) {
      return null;
    }

    if (typeof onError === 'function') {
      return onError(e);
    }

    return onError;
  }
}
