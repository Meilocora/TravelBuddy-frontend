"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "EventProvider", {
  enumerable: true,
  get: function () {
    return _eventProvider.default;
  }
});
exports.default = void 0;
var _eventProvider = _interopRequireDefault(require("./components/event-provider"));
var _outsidePressHandler = _interopRequireDefault(require("./components/outside-press-handler"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
var _default = _outsidePressHandler.default;
exports.default = _default;
//# sourceMappingURL=index.js.map