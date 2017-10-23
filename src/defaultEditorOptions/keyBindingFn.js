import { getDefaultKeyBinding } from 'draft-js';
import util from '../utils/util';

const os = util.getOS();
const shortcuts = require('../constants/shortcuts.json')[os] || {};

export default function keyBindingFn(event) {
  let command;
  Object.keys(shortcuts).forEach(key => {
    const conditions = shortcuts[key].shortcuts;
    if (
      conditions &&
      Object.keys(conditions).every(
        conditionKey => event[conditionKey] === conditions[conditionKey]
      )
    ) {
      command = key;
    }
  });
  if (command) return command;

  return getDefaultKeyBinding(event);
}
