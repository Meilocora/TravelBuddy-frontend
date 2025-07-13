function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
import React, { useRef, useEffect } from 'react';
import { View, Platform } from 'react-native';
import useEvent from '../hooks/use-event';
import deepClone from '../utils/deep-clone';
export default function OutsidePressHandler(props) {
  const {
    children,
    onOutsidePress,
    disabled = false
  } = props;
  const id = useRef(Math.random().toString()).current;
  const {
    appendEvent,
    removeEvent,
    setSkippedEventId
  } = useEvent();
  const setSkippedEventIdFunc = () => setSkippedEventId(id);
  useEffect(() => {
    appendEvent({
      id,
      onOutsidePress,
      disabled
    });
    return () => removeEvent(id);
  }, [onOutsidePress, disabled]);
  return Platform.select({
    web: /*#__PURE__*/React.createElement(View, _extends({}, props, {
      /*
      // @ts-ignore */
      onClick: setSkippedEventIdFunc
    }), deepClone(children, setSkippedEventIdFunc)),
    default: /*#__PURE__*/React.createElement(View, _extends({}, props, {
      onTouchStart: setSkippedEventIdFunc
    }), children)
  });
}
//# sourceMappingURL=outside-press-handler.js.map