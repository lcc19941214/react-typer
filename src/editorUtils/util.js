const util = {
  transformUpperWithHyphen: (str) => str.replace(/[A-Z]/g, (...arg) => `-${arg[0].toLowerCase()}`)
};

export default util;
