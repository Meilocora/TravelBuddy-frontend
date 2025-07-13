function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
import React, { useEffect } from 'react';
import { Platform, View } from 'react-native';
import useEvent from '../hooks/use-event';
import deepClone from '../utils/deep-clone';
export default function Container(props) {
  const {
    events,
    skippedEventId,
    setSkippedEventId
  } = useEvent();
  const runEvents = () => {
    events.forEach(event => {
      if (event.id === global.rnopSkippedEventId) return;
      if (event.disabled) return;
      event.onOutsidePress();
    });
    if (global.rnopSkippedEventId) setSkippedEventId('');
  };
  useEffect(() => {
    if (skippedEventId) runEvents();
  }, [skippedEventId]);
  return Platform.select({
    web: /*#__PURE__*/React.createElement(View, _extends({}, props, {
      /*
      // @ts-ignore */
      onClick: runEvents
    }), deepClone(props.children, runEvents)),
    default: /*#__PURE__*/React.createElement(View, _extends({}, props, {
      onTouchStart: runEvents
    }), props.children)
  });
}
//# sourceMappingURL=container.js.map