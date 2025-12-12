import { ReactElement, useContext } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
  runOnJS,
  SlideInDown,
  SlideOutDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import { StagesContext } from '../../../store/stages-context';
import ActivityContent from './ActivityContent';
import TransportationContent from './TransportationContent';
import AccommodationContent from './AccommodationContent';
import { GlobalStyles } from '../../../constants/styles';
import PlaceContent from './PlaceContent';
import { Location, LocationType } from '../../../models';
import { CustomCountryContext } from '../../../store/custom-country-context';
import { LatLng } from 'react-native-maps';

interface MapLocationElementProps {
  location: Location;
  onClose: () => void;
  addRoutePoint?: (coord: LatLng) => void;
}

const DISMISS_THRESHOLD = 40;

const MapLocationElement: React.FC<MapLocationElementProps> = ({
  location,
  onClose,
  addRoutePoint,
}): ReactElement => {
  const stagesCtx = useContext(StagesContext);
  const customCountryCtx = useContext(CustomCountryContext);

  let content: ReactElement;

  if (location.locationType === LocationType.placeToVisit) {
    if (location.placeId) {
      const country = customCountryCtx.findPlacesCountry(location);
      const place = country!.placesToVisit!.find(
        (place) => place.id === location.placeId
      );
      content = (
        <PlaceContent place={place!} addRoutePoint={handleAddRoutePoint} />
      );
    } else {
      const contextResponse = stagesCtx.findPlaceToVisit(
        location.minorStageName!,
        location.id!
      );
      content = (
        <PlaceContent
          minorStageId={contextResponse?.minorStageId!}
          place={contextResponse?.place!}
          addRoutePoint={handleAddRoutePoint}
        />
      );
    }
  } else if (location.locationType === LocationType.accommodation) {
    const minorStage = stagesCtx.findMinorStage(location.id!);
    content = (
      <AccommodationContent
        minorStageId={minorStage!.id}
        accommodation={minorStage?.accommodation!}
        addRoutePoint={handleAddRoutePoint}
      />
    );
  } else if (location.locationType === LocationType.activity) {
    const contextResponse = stagesCtx.findActivity(
      location.minorStageName!,
      location.id!
    );
    content = (
      <ActivityContent
        activity={contextResponse?.activity!}
        minorStageId={contextResponse?.minorStageId!}
        addRoutePoint={handleAddRoutePoint}
      />
    );
  } else if (
    location.locationType === LocationType.transportation_arrival ||
    location.locationType === LocationType.transportation_departure
  ) {
    const contextResponse = stagesCtx.findTransportation(
      location.belonging,
      location.minorStageName
    );
    content = (
      <TransportationContent
        minorStageId={contextResponse?.minorStageId}
        majorStageId={contextResponse?.majorStageId}
        transportation={contextResponse?.transportation!}
        locType={location.locationType}
        addRoutePoint={handleAddRoutePoint}
      />
    );
  }

  // Drag-to-dismiss logic
  const translateY = useSharedValue(0);
  const isDismissing = useSharedValue(false);
  const windowHeight = Dimensions.get('window').height;

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      // Nur nach unten ziehen erlauben; clamp zwischen 0 und windowHeight
      if (!isDismissing.value && event.translationY > 0) {
        translateY.value = Math.min(
          windowHeight,
          Math.max(0, event.translationY)
        );
      }
    })
    .onEnd((event) => {
      if (isDismissing.value) return;

      const finalTranslation = translateY.value || event.translationY;

      if (finalTranslation > DISMISS_THRESHOLD) {
        // Animieren nach unten außerhalb des Bildschirms, dann onClose auf JS-Thread aufrufen
        isDismissing.value = true;
        translateY.value = withTiming(
          windowHeight,
          { duration: 300 },
          (isFinished) => {
            if (isFinished) {
              runOnJS(onClose)();
            }
          }
        );
      } else {
        // Zurückfedern
        translateY.value = withSpring(0, {
          mass: 2,
          damping: 25,
          stiffness: 100,
        });
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  function handleAddRoutePoint(coord: LatLng) {
    onClose();
    addRoutePoint!(coord);
  }

  return (
    <View style={styles.container}>
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[styles.innerContainer, animatedStyle]}
          entering={SlideInDown}
          exiting={SlideOutDown}
        >
          {content!}
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    minHeight: '20%',
    width: '100%',
    bottom: 0,
    marginHorizontal: 'auto',
  },
  innerContainer: {
    zIndex: 1,
    marginHorizontal: 'auto',
    paddingTop: 10,
    width: '90%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'flex-start',
    borderWidth: 2,
    borderColor: GlobalStyles.colors.grayDark,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
});

export default MapLocationElement;
