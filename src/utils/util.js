const util = {
  transformUpperWithHyphen: (str) => str.replace(/[A-Z]/g, (...arg) => `-${arg[0].toLowerCase()}`),
  transformHyphenWithUpper: (str) => str.replace(/-[a-z]/g, (...arg) => arg[0].slice(1).toUpperCase()),
  getRelativeParent: element => {
    if (!element) {
      return null;
    }

    const position = window.getComputedStyle(element).getPropertyValue('position');
    if (position !== 'static') {
      return element;
    }

    return util.getRelativeParent(element.parentElement);
  }
};

export default util;
