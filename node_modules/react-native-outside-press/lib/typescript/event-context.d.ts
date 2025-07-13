/// <reference types="react" />
import type { IEvent } from './hooks/use-event-store';
export type EventContextType = {
    events: IEvent[];
    appendEvent: (newEvent: IEvent) => void;
    removeEvent: (id: string) => void;
    skippedEventId: string;
    setSkippedEventId: (id: string) => void;
};
declare const EventContext: import("react").Context<EventContextType | null>;
export default EventContext;
//# sourceMappingURL=event-context.d.ts.map