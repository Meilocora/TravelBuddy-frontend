import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Button from '../../UI/Button';
import {
  ButtonMode,
  ColorScheme,
  FilterKey,
  Location,
  LocationType,
} from '../../../models';
import { generateRandomString } from '../../../utils';
import { ReactElement, useState } from 'react';
import { GlobalStyles } from '../../../constants/styles';
import MapLocationListElement from '../MapLocationList/MapLocationListElement';
import ActivityIcon from '../../../../assets/activity.svg';
import AccommodationIcon from '../../../../assets/accommodation.svg';
import PlaceToVisitIcon from '../../../../assets/placeToVisit.svg';
import PlaneIcon from '../../../../assets/plane_clean.svg';

const heigth = 20;
const width = 20;

interface LocationsSelectionModalProps {
  showModal: boolean;
  setShowModal: (value: boolean) => void;
  choosableLocations: Location[];
  handleAddElement: (name: string) => void;
}

const LocationsSelectionModal: React.FC<LocationsSelectionModalProps> = ({
  showModal,
  setShowModal,
  choosableLocations,
  handleAddElement,
}): ReactElement => {
  const [filters, setFilters] = useState<Record<FilterKey, boolean>>({
    activities: true,
    accommodations: true,
    places: true,
    transportations: true,
  });

  function handleChangeFilter(filter: FilterKey) {
    setFilters((prev) => ({ ...prev, [filter]: !prev[filter] }));
  }

  let filteredLocations = choosableLocations;
  if (!filters.activities) {
    filteredLocations = filteredLocations.filter(
      (loc) => loc.locationType !== LocationType.activity
    );
  }
  if (!filters.accommodations) {
    filteredLocations = filteredLocations.filter(
      (loc) => loc.locationType !== LocationType.accommodation
    );
  }
  if (!filters.places) {
    filteredLocations = filteredLocations.filter(
      (loc) => loc.locationType !== LocationType.placeToVisit
    );
  }
  if (!filters.transportations) {
    filteredLocations = filteredLocations.filter(
      (loc) => !loc.locationType.startsWith('transportation')
    );
  }

  return (
    <Modal
      visible={showModal}
      transparent
      animationType='fade'
      onRequestClose={() => setShowModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.listContainer}>
          <View style={styles.iconsContainer}>
            <Pressable
              style={[
                styles.iconContainer,
                !filters.activities && styles.inactiveIconContainer,
              ]}
              onPress={() => handleChangeFilter('activities')}
            >
              <ActivityIcon
                width={width}
                height={heigth}
                fill={GlobalStyles.colors.grayDark}
              />
            </Pressable>
            <Pressable
              style={[
                styles.iconContainer,
                !filters.accommodations && styles.inactiveIconContainer,
              ]}
              onPress={() => handleChangeFilter('accommodations')}
            >
              <AccommodationIcon
                width={width}
                height={heigth}
                fill={GlobalStyles.colors.grayDark}
              />
            </Pressable>
            <Pressable
              style={[
                styles.iconContainer,
                !filters.places && styles.inactiveIconContainer,
              ]}
              onPress={() => handleChangeFilter('places')}
            >
              <PlaceToVisitIcon
                width={width}
                height={heigth}
                fill={GlobalStyles.colors.grayDark}
              />
            </Pressable>
            <Pressable
              style={[
                styles.iconContainer,
                !filters.transportations && styles.inactiveIconContainer,
              ]}
              onPress={() => handleChangeFilter('transportations')}
            >
              <PlaneIcon
                width={width}
                height={heigth}
                fill={GlobalStyles.colors.grayDark}
              />
            </Pressable>
          </View>
          <ScrollView style={styles.list} nestedScrollEnabled>
            {filteredLocations.map((loc: Location) => (
              <MapLocationListElement
                location={loc}
                onPress={() => handleAddElement(loc.data.name)}
                selected={false}
                key={generateRandomString()}
              />
            ))}
          </ScrollView>
          <Button
            colorScheme={ColorScheme.neutral}
            mode={ButtonMode.flat}
            onPress={() => setShowModal(false)}
            style={styles.button}
            textStyle={styles.buttonText}
          >
            Dismiss
          </Button>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconsContainer: {
    width: '70%',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginVertical: 10,
  },
  iconContainer: {
    padding: 6,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  inactiveIconContainer: {
    opacity: 0.4,
  },
  listContainer: {
    height: '70%',
    width: '80%',
    alignItems: 'center',
    paddingTop: 10,
    backgroundColor: GlobalStyles.colors.graySoft,
    borderColor: GlobalStyles.colors.grayMedium,
    borderWidth: 1,
    borderRadius: 20,
    zIndex: 2,
  },
  list: {
    maxWidth: '80%',
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: GlobalStyles.colors.grayMedium,
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
  },
  listElementContainer: {
    borderColor: GlobalStyles.colors.grayMedium,
  },
  listElementText: {
    color: GlobalStyles.colors.grayMedium,
  },
  button: {
    marginHorizontal: 'auto',
  },
  buttonText: {
    color: GlobalStyles.colors.grayMedium,
  },
});

export default LocationsSelectionModal;
