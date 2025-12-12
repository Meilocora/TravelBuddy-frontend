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
import { ButtonMode, ColorScheme, Icons, MapType } from '../../models';
import SettingItem from './SettingItem';
import { MapViewDirectionsMode } from 'react-native-maps-directions';
import Button from '../UI/Button';

interface MapSettingsProps {
  onClose: () => void;
  setMode: (mode: MapViewDirectionsMode) => void;
  mode: MapViewDirectionsMode;
  setMapType: (newType: MapType) => void;
  mapType: MapType;
  toggleShowPastLocations?: () => void;
  showPastLocations?: boolean;
  toggleShowAllPlaces?: () => void;
  showAllPlaces?: boolean;
  toggleShowImages?: () => void;
  showImages?: boolean;
}

const MapSettings: React.FC<MapSettingsProps> = ({
  onClose,
  setMode,
  mode,
  setMapType,
  mapType,
  toggleShowPastLocations,
  showPastLocations,
  toggleShowAllPlaces,
  showAllPlaces,
  toggleShowImages,
  showImages,
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

      if (event.translationY < 50) {
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
                  : GlobalStyles.colors.graySoft
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
                  : GlobalStyles.colors.graySoft
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
                  : GlobalStyles.colors.graySoft
              }
              containerStyle={
                mode === 'DRIVING' ? styles.activeButton : styles.button
              }
            />
          </View>
        </View>
        {typeof showPastLocations === 'boolean' && (
          <SettingItem
            onPress={toggleShowPastLocations!}
            state={showPastLocations}
          >
            Show past Locations
          </SettingItem>
        )}
        {typeof showAllPlaces === 'boolean' && (
          <SettingItem onPress={toggleShowAllPlaces!} state={showAllPlaces}>
            Show all Places of country
          </SettingItem>
        )}
        {typeof showImages === 'boolean' && (
          <SettingItem onPress={toggleShowImages!} state={showImages}>
            Show Images
          </SettingItem>
        )}
        <View>
          <Text style={styles.subTitle}>Map Type</Text>
          <View style={styles.buttonRow}>
            <Button
              colorScheme={ColorScheme.neutral}
              onPress={() => setMapType('standard')}
              mode={ButtonMode.flat}
              textStyle={
                mapType === 'standard'
                  ? styles.activeTextButtonText
                  : styles.textButtonText
              }
              style={
                mapType === 'standard'
                  ? styles.activeTextButton
                  : styles.textButton
              }
            >
              Standard
            </Button>
            <Button
              colorScheme={ColorScheme.neutral}
              onPress={() => setMapType('satellite')}
              mode={ButtonMode.flat}
              textStyle={
                mapType === 'satellite'
                  ? styles.activeTextButtonText
                  : styles.textButtonText
              }
              style={
                mapType === 'satellite'
                  ? styles.activeTextButton
                  : styles.textButton
              }
            >
              Satellite
            </Button>
            <Button
              colorScheme={ColorScheme.neutral}
              onPress={() => setMapType('hybrid')}
              mode={ButtonMode.flat}
              textStyle={
                mapType === 'hybrid'
                  ? styles.activeTextButtonText
                  : styles.textButtonText
              }
              style={
                mapType === 'hybrid'
                  ? styles.activeTextButton
                  : styles.textButton
              }
            >
              Hybrid
            </Button>
            <Button
              colorScheme={ColorScheme.neutral}
              onPress={() => setMapType('terrain')}
              mode={ButtonMode.flat}
              textStyle={
                mapType === 'terrain'
                  ? styles.activeTextButtonText
                  : styles.textButtonText
              }
              style={
                mapType === 'terrain'
                  ? styles.activeTextButton
                  : styles.textButton
              }
            >
              Terrain
            </Button>
          </View>
        </View>
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 3,
    width: '100%',
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
    borderColor: GlobalStyles.colors.graySoft,
  },
  activeButton: {
    padding: 2,
    marginHorizontal: 2,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: GlobalStyles.colors.amberAccent,
    backgroundColor: GlobalStyles.colors.amberSoft,
  },
  textButton: {
    marginHorizontal: 4,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: GlobalStyles.colors.graySoft,
  },
  activeTextButton: {
    marginHorizontal: 4,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: GlobalStyles.colors.amberAccent,
    backgroundColor: GlobalStyles.colors.amberSoft,
  },
  textButtonText: {
    color: GlobalStyles.colors.graySoft,
  },
  activeTextButtonText: {
    color: GlobalStyles.colors.amberAccent,
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
  subTitle: {
    marginTop: 10,
    color: GlobalStyles.colors.graySoft,
    fontSize: 18,
    textDecorationLine: 'underline',
    textAlign: 'center',
  },
});

export default MapSettings;
