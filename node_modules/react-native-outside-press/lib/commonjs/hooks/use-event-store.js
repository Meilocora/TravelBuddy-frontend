"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = useEventStore;
var _react = require("react");
function useEventStore() {
  const [events, setEvents] = (0, _react.useState)([]);
  const [skippedEventId, setSkippedEventId] = (0, _react.useState)('');
  const eventActions = (0, _react.useMemo)(() => ({
    events,
    appendEvent: newEvent => setEvents(state => [...state, newEvent]),
    removeEvent: id => setEvents(state => state.filter(event => event.id !== id)),
    skippedEventId,
    setSkippedEventId: id => {
      global.rnopSkippedEventId = id;
      setSkippedEventId(id);
    }
  }), [skippedEventId, events]);
  return eventActions;
}
//# sourceMappingURL=use-event-store.js.map