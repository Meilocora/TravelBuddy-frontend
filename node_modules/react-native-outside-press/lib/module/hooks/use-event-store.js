import { useState, useMemo } from 'react';
export default function useEventStore() {
  const [events, setEvents] = useState([]);
  const [skippedEventId, setSkippedEventId] = useState('');
  const eventActions = useMemo(() => ({
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