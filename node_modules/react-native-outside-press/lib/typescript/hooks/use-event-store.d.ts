export interface IEvent {
    id: string;
    onOutsidePress: () => void;
    disabled: boolean;
}
export default function useEventStore(): {
    events: IEvent[];
    appendEvent: (newEvent: IEvent) => void;
    removeEvent: (id: string) => void;
    skippedEventId: string;
    setSkippedEventId: (id: string) => void;
};
//# sourceMappingURL=use-event-store.d.ts.map