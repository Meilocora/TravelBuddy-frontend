import { ReactElement } from 'react';
import { Dimensions, StyleSheet, View, Text } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  SlideInUp,
  SlideOutUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { GlobalStyles } from '../../constants/styles';
import IconButton from '../UI/IconButton';
import { Icons } from '../../models';
import SettingItem from './SettingItem';
import { MapViewDirectionsMode } from 'react-native-maps-directions';

interface MapSettingsProps {
  onClose: () => void;
  toggleShowPastLocations: () => void;
  showPastLocations: boolean;
  toggleShowAllPlaces: () => void;
  showAllPlaces: boolean;
  mode: MapViewDirectionsMode;

  setMode: (mode: MapViewDirectionsMode) => void;
}

const MapSettings: React.FC<MapSettingsProps> = ({
  onClose,
  toggleShowPastLocations,
  showPastLocations,
  toggleShowAllPlaces,
  showAllPlaces,
  mode,
  setMode,
}): ReactElement => {
  // Drag-to-dismiss logic
  const translateY = useSharedValue(0);
  const isDismissing = useSharedValue(false); // Guard: verhindert mehrfaches Dismiss

  const windowHeight = Dimensions.get('window').height;

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      // nur wenn noch nicht im Dismiss- Ablauf
      if (!isDismissing.value && event.translationY < 0) {
        translateY.value = event.translationY;
      }
    })
    .onEnd((event) => {
      if (isDismissing.value) return; // bereits unterwegs -> nichts tun

      if (event.translationY > -100) {
        // Starte das Slide-Down bis außerhalb des Screens, dann runOnJS(onCancel)
        isDismissing.value = true;
        translateY.value = withSpring(
          -windowHeight / 2,
          {
            mass: 2,
            damping: 25,
            stiffness: 100,
          },
          (isFinished) => {
            if (isFinished) {
              runOnJS(onClose)(); // Aufruf im JS-Thread nachdem Animation fertig ist
            }
          }
        );
      } else {
        // Zurückfederung nach oben
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
    <GestureDetector gesture={panGesture}>
      <Animated.View
        entering={SlideInUp}
        exiting={SlideOutUp}
        style={[styles.container, animatedStyle]}
      >
        <View style={styles.directionsRow}>
          <Text style={styles.text}>Mode for directions</Text>
          <View style={styles.buttonRow}>
            <IconButton
              icon={Icons.walk}
              onPress={() => setMode('WALKING')}
              color={
                mode === 'WALKING'
                  ? GlobalStyles.colors.amberAccent
                  : GlobalStyles.colors.grayDark
              }
              containerStyle={
                mode === 'WALKING' ? styles.activeButton : styles.button
              }
            />
            <IconButton
              icon={Icons.bicycle}
              onPress={() => setMode('BICYCLING')}
              color={
                mode === 'BICYCLING'
                  ? GlobalStyles.colors.amberAccent
                  : GlobalStyles.colors.grayDark
              }
              containerStyle={
                mode === 'BICYCLING' ? styles.activeButton : styles.button
              }
            />
            <IconButton
              icon={Icons.car}
              onPress={() => setMode('DRIVING')}
              color={
                mode === 'DRIVING'
                  ? GlobalStyles.colors.amberAccent
                  : GlobalStyles.colors.grayDark
              }
              containerStyle={
                mode === 'DRIVING' ? styles.activeButton : styles.button
              }
            />
          </View>
        </View>
        <SettingItem
          onPress={toggleShowPastLocations}
          state={showPastLocations}
        >
          Show past Locations
        </SettingItem>
        <SettingItem onPress={toggleShowAllPlaces} state={showAllPlaces}>
          Show all Places of country
        </SettingItem>
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 3,
    width: '100%',
    height: '27%',
    backgroundColor: GlobalStyles.colors.grayMedium,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 2,
    borderColor: GlobalStyles.colors.graySoft,
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 6,
    marginHorizontal: 'auto',
  },
  button: {
    padding: 2,
    marginHorizontal: 2,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: 'black',
  },
  activeButton: {
    padding: 2,
    marginHorizontal: 2,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: GlobalStyles.colors.amberAccent,
    backgroundColor: GlobalStyles.colors.amberSoft,
  },
  directionsRow: {
    flexDirection: 'row',
    width: '85%',
    marginHorizontal: 'auto',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  text: {
    color: GlobalStyles.colors.graySoft,
    fontSize: 16,
    textAlign: 'center',
  },
});

export default MapSettings;
