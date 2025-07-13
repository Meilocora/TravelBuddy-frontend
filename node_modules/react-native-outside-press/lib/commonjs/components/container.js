"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = Container;
var _react = _interopRequireWildcard(require("react"));
var _reactNative = require("react-native");
var _useEvent = _interopRequireDefault(require("../hooks/use-event"));
var _deepClone = _interopRequireDefault(require("../utils/deep-clone"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
function Container(props) {
  const {
    events,
    skippedEventId,
    setSkippedEventId
  } = (0, _useEvent.default)();
  const runEvents = () => {
    events.forEach(event => {
      if (event.id === global.rnopSkippedEventId) return;
      if (event.disabled) return;
      event.onOutsidePress();
    });
    if (global.rnopSkippedEventId) setSkippedEventId('');
  };
  (0, _react.useEffect)(() => {
    if (skippedEventId) runEvents();
  }, [skippedEventId]);
  return _reactNative.Platform.select({
    web: /*#__PURE__*/_react.default.createElement(_reactNative.View, _extends({}, props, {
      /*
      // @ts-ignore */
      onClick: runEvents
    }), (0, _deepClone.default)(props.children, runEvents)),
    default: /*#__PURE__*/_react.default.createElement(_reactNative.View, _extends({}, props, {
      onTouchStart: runEvents
    }), props.children)
  });
}
//# sourceMappingURL=container.js.map