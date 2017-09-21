const util = {
  transformUpperWithHyphen: (str) => str.replace(/[A-Z]/g, (...arg) => `-${arg[0].toLowerCase()}`),
  transformHyphenWithUpper: (str) => str.replace(/-[a-z]/g, (...arg) => arg[0].slice(1).toUpperCase()),
};

export default util;
