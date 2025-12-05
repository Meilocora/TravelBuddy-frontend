import { createContext, useEffect, useState } from 'react';

import {
  Activity,
  Journey,
  MajorStage,
  MinorStage,
  PlaceToVisit,
  Transportation,
} from '../models';
import { fetchStagesDatas } from '../utils/http';
import { parseDate, parseDateAndTime, parseEndDate } from '../utils';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ActiveHeader {
  minorStageId?: number;
  header?: string;
}

interface CurrentShownElements {
  nextJourney: boolean;
  currentMinorStage: boolean;
  currentAccommodation: boolean;
  nextTransportation: boolean;
}

export enum Indicators {
  nextJourney = 'nextJourney',
  currentMinorStage = 'currentMinorStage',
  currentAccommodation = 'currentAccommodation',
  nextTransportation = 'nextTransportation',
}

interface StagesContextType {
  journeys: Journey[];
  fetchStagesData: () => Promise<void | string>;
  findJourney: (journeyId: number) => Journey | undefined;
  findMajorStage: (majorStageId: number) => MajorStage | undefined;
  findMinorStage: (minorStageId: number) => MinorStage | undefined;
  findMajorStagesJourney: (majorStageId: number) => Journey | undefined;
  findMinorStagesMajorStage: (minorStageId: number) => MajorStage | undefined;
  findActivity: (
    minorStageName: string,
    activityId: number
  ) => { minorStageId: number; activity: Activity | undefined } | undefined;
  findPlaceToVisit: (
    minorStageName: string,
    placeId: number
  ) => { minorStageId: number; place: PlaceToVisit | undefined } | undefined;
  findTransportation: (
    majorStageName: string,
    minorStageName?: string
  ) =>
    | {
        minorStageId: number | undefined;
        majorStageId: number | undefined;
        transportation: Transportation | undefined;
      }
    | undefined;
  selectedJourneyId?: number;
  setSelectedJourneyId: (id: number) => void;
  activeHeader: ActiveHeader;
  setActiveHeaderHandler: (minorStageId: number, header: string) => void;
  shownCurrentElements: CurrentShownElements;
  setShownCurrentElementsHandler: (
    indicator: Indicators,
    bool: boolean
  ) => void;
  findNextJourney: () => undefined | Journey;
  findCurrentMinorStage: () => undefined | MinorStage;
  findNextTransportation: () => undefined | Transportation;
  findTransportationsStage: (
    transportationId: number
  ) => undefined | MajorStage | MinorStage;
  findAssignedPlaces: (
    countryId: number,
    minorStageId: number
  ) => undefined | PlaceToVisit[];
  findAllMinorStages: () => undefined | MinorStage[];
}

export const StagesContext = createContext<StagesContextType>({
  journeys: [],
  fetchStagesData: async () => {},
  findJourney: () => undefined,
  findMajorStage: () => undefined,
  findMinorStage: () => undefined,
  findMajorStagesJourney: () => undefined,
  findMinorStagesMajorStage: () => undefined,
  findActivity: () => undefined,
  findPlaceToVisit: () => undefined,
  findTransportation: () => undefined,
  selectedJourneyId: undefined,
  setSelectedJourneyId: () => {},
  activeHeader: {},
  setActiveHeaderHandler(minorStageId, header) {},
  shownCurrentElements: {
    nextJourney: false,
    currentMinorStage: false,
    currentAccommodation: false,
    nextTransportation: false,
  },
  setShownCurrentElementsHandler: (indicator: Indicators, bool: boolean) => {},
  findNextJourney: () => undefined,
  findCurrentMinorStage: () => undefined,
  findNextTransportation: () => undefined,
  findTransportationsStage: () => undefined,
  findAssignedPlaces: (countryId, minorStageId) => undefined,
  findAllMinorStages: () => undefined,
});

export default function StagesContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [selectedJourneyId, setSelectedJourneyId] = useState<
    number | undefined
  >(undefined);
  const [activeHeader, setActiveHeader] = useState<ActiveHeader>({
    minorStageId: undefined,
    header: undefined,
  });
  const [shownCurrentElements, setShownCurrentElements] =
    useState<CurrentShownElements>({
      nextJourney: true,
      currentMinorStage: true,
      currentAccommodation: true,
      nextTransportation: true,
    });

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    timers.push(
      setTimeout(() => {
        setShownCurrentElements((prev) => ({
          ...prev,
          nextJourney: false,
        }));
      }, 1000)
    );
    timers.push(
      setTimeout(() => {
        setShownCurrentElements((prev) => ({
          ...prev,
          nextTransportation: false,
        }));
      }, 1200)
    );
    timers.push(
      setTimeout(() => {
        setShownCurrentElements((prev) => ({
          ...prev,
          currentAccommodation: false,
        }));
      }, 1400)
    );
    timers.push(
      setTimeout(() => {
        setShownCurrentElements((prev) => ({
          ...prev,
          currentMinorStage: false,
        }));
      }, 1600)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  const [shouldSetStages, setShouldSetStages] = useState(false);

  // If user is offline, the local stored data is used
  useEffect(() => {
    (async () => {
      const storedJourneys = await AsyncStorage.getItem('journeys');
      if (storedJourneys) {
        setJourneys(JSON.parse(storedJourneys));
        setShouldSetStages(true);
      }
    })();
  }, []);

  async function fetchStagesData(): Promise<void | string> {
    const response = await fetchStagesDatas();

    if (response.journeys) {
      setJourneys(response.journeys);
      AsyncStorage.setItem('journeys', JSON.stringify(journeys));
      setShouldSetStages(true); // trigger effect
    } else {
      return response.error;
    }
  }

  useEffect(() => {
    if (shouldSetStages && journeys.length > 0) {
      setCurrentStages();
      setShouldSetStages(false); // prevent loop
    }
  }, [shouldSetStages, journeys]);

  function findJourney(journeyId: number) {
    const journey = journeys.find((journey) => journey.id === journeyId);
    return journey;
  }

  function findMajorStage(majorStageId: number) {
    if (majorStageId === 0) {
      return undefined;
    }

    if (Array.isArray(journeys)) {
      for (const key in journeys) {
        const journey = journeys[key];

        const majorStage = journey.majorStages?.find(
          (majorStage) => majorStage.id === majorStageId
        );
        if (majorStage) {
          return majorStage;
        }
      }
    } else {
      return;
    }
  }

  function findMinorStage(minorStageId: number) {
    if (minorStageId === 0) {
      return undefined;
    }

    for (const journey of journeys) {
      for (const majorStage of journey.majorStages || []) {
        const minorStage = majorStage.minorStages?.find(
          (minorStage) => minorStage.id === minorStageId
        );
        if (minorStage) {
          return minorStage;
        }
      }
    }

    return undefined;
  }

  function findMajorStagesJourney(majorStageId: number) {
    if (majorStageId === 0) {
      return undefined;
    }

    if (Array.isArray(journeys)) {
      for (const key in journeys) {
        const journey = journeys[key];

        const majorStage = journey.majorStages?.find(
          (majorStage) => majorStage.id === majorStageId
        );
        if (majorStage) {
          return journey;
        }
      }
    } else {
      return journeys[0];
    }
  }

  function findMinorStagesMajorStage(minorStageId: number) {
    if (minorStageId === 0) {
      return undefined;
    }

    for (const journey of journeys) {
      for (const majorStage of journey.majorStages || []) {
        const minorStage = majorStage.minorStages?.find(
          (minorStage) => minorStage.id === minorStageId
        );
        if (minorStage) {
          return majorStage;
        }
      }
    }

    return undefined;
  }

  function findActivity(minorStageName: string, activityId: number) {
    for (const journey of journeys) {
      for (const majorStage of journey.majorStages || []) {
        const minorStage = majorStage.minorStages?.find(
          (minorStage) => minorStage.title === minorStageName
        );
        if (minorStage) {
          const activity = minorStage.activities!.find(
            (activity) => activity.id === activityId
          );
          return { minorStageId: minorStage.id, activity };
        }
      }
    }
  }

  function findPlaceToVisit(minorStageName: string, placeId: number) {
    for (const journey of journeys) {
      for (const majorStage of journey.majorStages || []) {
        const minorStage = majorStage.minorStages?.find(
          (minorStage) => minorStage.title === minorStageName
        );
        if (minorStage) {
          const place = minorStage.placesToVisit!.find(
            (place) => place.id === placeId
          );
          return { minorStageId: minorStage.id, place };
        }
      }
    }
  }

  function findTransportation(majorStageName: string, minorStageName?: string) {
    if (!minorStageName) {
      for (const journey of journeys) {
        const majorStage = journey.majorStages?.find(
          (majorStage) => majorStage.title === majorStageName
        );
        if (majorStage) {
          return {
            minorStageId: undefined,
            majorStageId: majorStage.id,
            transportation: majorStage.transportation,
          };
        }
      }
    } else {
      for (const journey of journeys) {
        for (const majorStage of journey.majorStages || []) {
          const minorStage = majorStage.minorStages?.find(
            (minorStage) => minorStage.title === minorStageName
          );
          if (minorStage) {
            return {
              minorStageId: minorStage.id,
              majorStageId: undefined,
              transportation: minorStage.transportation,
            };
          }
        }
      }
    }
  }

  function setActiveHeaderHandler(minorStageId: number, header: string) {
    setActiveHeader({ minorStageId, header });
  }

  function setCurrentStages() {
    const currentDate = new Date();
    for (const journey of journeys) {
      if (
        parseDate(journey.scheduled_start_time) <= currentDate &&
        currentDate <= parseEndDate(journey.scheduled_end_time)
      ) {
        setCurrentJourney(journey.id);
        for (const majorStage of journey.majorStages || []) {
          if (
            parseDate(majorStage.scheduled_start_time) <= currentDate &&
            currentDate <= parseEndDate(majorStage.scheduled_end_time)
          ) {
            setCurrentMajorStage(majorStage.id);
            for (const minorStage of majorStage.minorStages || []) {
              if (
                parseDate(minorStage.scheduled_start_time) <= currentDate &&
                currentDate <= parseEndDate(minorStage.scheduled_end_time)
              ) {
                setCurrentMinorStage(minorStage.id);
              }
            }
          }
        }
      }
    }
  }

  function setCurrentJourney(journeyId: number) {
    setJourneys((prevJourneys) =>
      prevJourneys.map((journey) =>
        journey.id === journeyId
          ? { ...journey, currentJourney: true }
          : { ...journey, currentJourney: false }
      )
    );
  }

  function setCurrentMajorStage(majorStageId: number) {
    setJourneys((prevJourneys) =>
      prevJourneys.map((journey) => ({
        ...journey,
        majorStages: journey.majorStages?.map((majorStage) =>
          majorStage.id === majorStageId
            ? { ...majorStage, currentMajorStage: true }
            : { ...majorStage, currentMajorStage: false }
        ),
      }))
    );
  }

  function setCurrentMinorStage(minorStageId: number) {
    setJourneys((prevJourneys) =>
      prevJourneys.map((journey) => ({
        ...journey,
        majorStages: journey.majorStages?.map((majorStage) => ({
          ...majorStage,
          minorStages: majorStage.minorStages?.map((minorStage) =>
            minorStage.id === minorStageId
              ? { ...minorStage, currentMinorStage: true }
              : { ...minorStage, currentMinorStage: false }
          ),
        })),
      }))
    );
  }

  function setShownCurrentElementsHandler(
    indicator: Indicators,
    bool: boolean
  ) {
    setShownCurrentElements((prevValues) => {
      return {
        ...prevValues,
        [indicator]: bool,
      };
    });
  }

  function findNextJourney(): undefined | Journey {
    if (journeys.length === 0) {
      return undefined;
    }
    const currentJourney = journeys.find((journey) => journey.currentJourney);
    if (currentJourney) {
      return undefined;
    }
    for (const journey of journeys) {
      if (parseDate(journey.scheduled_start_time) >= new Date()) {
        return journey;
      }
    }
    return undefined;
  }

  function findCurrentMinorStage(): undefined | MinorStage {
    if (journeys.length === 0) {
      return undefined;
    }
    for (const journey of journeys) {
      if (journey.majorStages) {
        for (const majorStage of journey.majorStages || []) {
          if (majorStage.minorStages) {
            for (const minorStage of majorStage.minorStages || []) {
              if (minorStage.currentMinorStage) {
                return minorStage;
              }
            }
          }
        }
      }
    }
    return undefined;
  }

  function findNextTransportation(): undefined | Transportation {
    const now = new Date();
    const currentJourney = journeys.find((journey) => journey.currentJourney);
    if (!currentJourney) return undefined;

    const transportations: Transportation[] = [];

    for (const majorStage of currentJourney.majorStages || []) {
      if (majorStage.transportation) {
        transportations.push(majorStage.transportation);
      }
      for (const minorStage of majorStage.minorStages || []) {
        if (minorStage.transportation) {
          transportations.push(minorStage.transportation);
        }
      }
    }
    const sortedTransportations = transportations.sort(
      (a, b) =>
        new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
    );

    for (const transportation of sortedTransportations) {
      if (parseDateAndTime(transportation.start_time) > now) {
        return transportation;
      }
    }
    return undefined;
  }

  function findTransportationsStage(
    transportationId: number
  ): MinorStage | MajorStage | undefined {
    for (const journey of journeys) {
      for (const majorStage of journey.majorStages || []) {
        if (
          majorStage.transportation &&
          majorStage.transportation.id === transportationId
        ) {
          return majorStage;
        }
        for (const minorStage of majorStage.minorStages || []) {
          if (
            minorStage.transportation &&
            minorStage.transportation.id === transportationId
          ) {
            return minorStage;
          }
        }
      }
    }
    return undefined;
  }

  function findAssignedPlaces(
    countryId: number,
    minorStageId: number
  ): undefined | PlaceToVisit[] {
    const majorStage = findMinorStagesMajorStage(minorStageId);
    const journey = findMajorStagesJourney(majorStage!.id);

    let assignedPlaces: PlaceToVisit[] = [];
    if (!journey!.majorStages) {
      return undefined;
    }
    for (const majorStage of journey!.majorStages) {
      if (!majorStage.minorStages) {
        continue;
      }
      if (majorStage.country.id === countryId) {
        for (const minorStage of majorStage.minorStages) {
          if (!minorStage.placesToVisit || minorStage.id === minorStageId) {
            continue;
          }
          for (const place of minorStage.placesToVisit) {
            assignedPlaces.push(place);
          }
        }
      }
    }

    return assignedPlaces;
  }

  function findAllMinorStages() {
    if (journeys.length === 0 || !journeys) {
      return undefined;
    }
    const minorStages = [];
    for (const journey of journeys) {
      if (journey.majorStages?.length === 0 || !journey.majorStages) continue;
      for (const majorStage of journey.majorStages) {
        if (majorStage.minorStages?.length === 0 || !majorStage.minorStages)
          continue;
        for (const minorStage of majorStage.minorStages) {
          minorStages.push(minorStage);
        }
      }
    }
    return minorStages;
  }

  const value = {
    journeys,
    fetchStagesData,
    findJourney,
    findMajorStage,
    findMinorStage,
    findMajorStagesJourney,
    findMinorStagesMajorStage,
    findActivity,
    findPlaceToVisit,
    findTransportation,
    selectedJourneyId,
    setSelectedJourneyId,
    activeHeader,
    setActiveHeaderHandler,
    shownCurrentElements,
    setShownCurrentElementsHandler,
    findNextJourney,
    findCurrentMinorStage,
    findNextTransportation,
    findTransportationsStage,
    findAssignedPlaces,
    findAllMinorStages,
  };

  return (
    <StagesContext.Provider value={value}>{children}</StagesContext.Provider>
  );
}
