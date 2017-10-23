import { getDefaultKeyBinding, KeyBindingUtil } from 'draft-js';

const { hasCommandModifier } = KeyBindingUtil;

export default function keyBindingFn(e) {
  if (hasCommandModifier(e)) {
    switch (e.keyCode) {
      case 75:
        if (e.metaKey) {
          return 'link';
        }
      default:
    }
  }
  return getDefaultKeyBinding(e);
}
