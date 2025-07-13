import { ReactElement, useContext } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  runOnJS,
  SlideInDown,
  SlideOutDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import { StagesContext } from '../../../store/stages-context';
import ActivityContent from './ActivityContent';
import TransportationContent from './TransportationContent';
import AccommodationContent from './AccommodationContent';
import { GlobalStyles } from '../../../constants/styles';
import PlaceContent from './PlaceContent';
import { Location, LocationType } from '../../../models';

interface MapLocationElementProps {
  location: Location;
  onClose: () => void;
}

const DISMISS_THRESHOLD = 100;

const MapLocationElement: React.FC<MapLocationElementProps> = ({
  location,
  onClose,
}): ReactElement => {
  const stagesCtx = useContext(StagesContext);

  let content: ReactElement;

  if (location.locationType === LocationType.placeToVisit) {
    const contextResponse = stagesCtx.findPlaceToVisit(
      location.minorStageName!,
      location.id!
    );
    content = (
      <PlaceContent
        minorStageId={contextResponse?.minorStageId!}
        place={contextResponse?.place!}
      />
    );
  } else if (location.locationType === LocationType.accommodation) {
    const minorStage = stagesCtx.findMinorStage(location.id!);
    content = (
      <AccommodationContent
        minorStageId={minorStage!.id}
        accommodation={minorStage?.accommodation!}
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
      />
    );
  }

  // Drag-to-dismiss logic
  const translateY = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (event.translationY > 0) {
        translateY.value = event.translationY;
      }
    })
    .onEnd((event) => {
      if (event.translationY > DISMISS_THRESHOLD) {
        runOnJS(onClose)();
      } else {
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
    maxHeight: '40%',
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
    borderColor: GlobalStyles.colors.gray500,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
});

export default MapLocationElement;
