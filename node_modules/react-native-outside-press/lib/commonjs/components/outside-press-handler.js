"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = OutsidePressHandler;
var _react = _interopRequireWildcard(require("react"));
var _reactNative = require("react-native");
var _useEvent = _interopRequireDefault(require("../hooks/use-event"));
var _deepClone = _interopRequireDefault(require("../utils/deep-clone"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
function OutsidePressHandler(props) {
  const {
    children,
    onOutsidePress,
    disabled = false
  } = props;
  const id = (0, _react.useRef)(Math.random().toString()).current;
  const {
    appendEvent,
    removeEvent,
    setSkippedEventId
  } = (0, _useEvent.default)();
  const setSkippedEventIdFunc = () => setSkippedEventId(id);
  (0, _react.useEffect)(() => {
    appendEvent({
      id,
      onOutsidePress,
      disabled
    });
    return () => removeEvent(id);
  }, [onOutsidePress, disabled]);
  return _reactNative.Platform.select({
    web: /*#__PURE__*/_react.default.createElement(_reactNative.View, _extends({}, props, {
      /*
      // @ts-ignore */
      onClick: setSkippedEventIdFunc
    }), (0, _deepClone.default)(children, setSkippedEventIdFunc)),
    default: /*#__PURE__*/_react.default.createElement(_reactNative.View, _extends({}, props, {
      onTouchStart: setSkippedEventIdFunc
    }), children)
  });
}
//# sourceMappingURL=outside-press-handler.js.map