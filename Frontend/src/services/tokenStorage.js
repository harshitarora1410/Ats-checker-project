// Access + refresh tokens.
// "Keep me signed in" checked   -> localStorage (survives browser restart)
// "Keep me signed in" unchecked -> sessionStorage (cleared when the tab closes)

const ACCESS = "ats.access_token";
const REFRESH = "ats.refresh_token";

const read = (k) => {
  try {
    return localStorage.getItem(k) || sessionStorage.getItem(k);
  } catch {
    return null;
  }
};

const activeStore = () => {
  try {
    return localStorage.getItem(ACCESS) ? localStorage : sessionStorage;
  } catch {
    return sessionStorage;
  }
};

export const tokenStorage = {
  getAccess: () => read(ACCESS),
  getRefresh: () => read(REFRESH),

  // `remember` undefined = keep using the current store (token refresh)
  set({ access_token, refresh_token }, remember) {
    const store = remember === undefined ? activeStore() : remember ? localStorage : sessionStorage;
    const other = store === localStorage ? sessionStorage : localStorage;
    other.removeItem(ACCESS);
    other.removeItem(REFRESH);
    store.setItem(ACCESS, access_token);
    if (refresh_token) store.setItem(REFRESH, refresh_token);
  },

  clear() {
    for (const store of [localStorage, sessionStorage]) {
      store.removeItem(ACCESS);
      store.removeItem(REFRESH);
    }
  },
};
