"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = EventProvider;
var _react = _interopRequireDefault(require("react"));
var _reactNative = require("react-native");
var _useEventStore = _interopRequireDefault(require("../hooks/use-event-store"));
var _eventContext = _interopRequireDefault(require("../event-context"));
var _container = _interopRequireDefault(require("./container"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
function EventProvider(props) {
  const {
    style,
    ...rest
  } = props;
  const eventStore = (0, _useEventStore.default)();
  return /*#__PURE__*/_react.default.createElement(_eventContext.default.Provider, {
    value: eventStore
  }, /*#__PURE__*/_react.default.createElement(_container.default, _extends({
    style: [styles.container, style]
  }, rest), props.children));
}
const styles = _reactNative.StyleSheet.create({
  container: {
    flex: 1
  }
});
//# sourceMappingURL=event-provider.js.map