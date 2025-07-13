"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = useEvent;
var _react = require("react");
var _eventContext = _interopRequireDefault(require("../event-context"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function useEvent() {
  const eventContext = (0, _react.useContext)(_eventContext.default);
  return eventContext;
}
//# sourceMappingURL=use-event.js.map