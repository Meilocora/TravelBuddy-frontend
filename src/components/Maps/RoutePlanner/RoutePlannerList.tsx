import { ReactElement, useState } from 'react';
import { StyleSheet, View, ScrollView, Modal } from 'react-native';
import DraggableFlatList from 'react-native-draggable-flatlist';

import { GlobalStyles } from '../../../constants/styles';
import { ColorScheme, Location } from '../../../models';
import Button from '../../UI/Button';
import RoutePlannerListElement from './RoutePlannerListElement';
import LocationsSelectionModal from './LocationsSelectionModal';

interface RoutePlannerListProps {
  locations: Location[];
  routeElements: string[];
  onAddElement: (loc: string, index: number) => void;
  onRemoveElement: (loc: string) => void;
  onSwitchElements: (locs: string[]) => void;
}

const RoutePlannerList: React.FC<RoutePlannerListProps> = ({
  locations,
  routeElements,
  onAddElement,
  onRemoveElement,
  onSwitchElements,
}): ReactElement => {
  const [showModal, setShowModal] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const choosableLocations = locations.filter(
    (loc) => !routeElements.includes(loc.data.name)
  );

  function handlePressButton() {
    setCurrentIndex(99);
    setShowModal(true);
  }

  function handlePressElement(index: number) {
    setCurrentIndex(index);
    setShowModal(true);
  }

  function handleAddElement(name: string) {
    onAddElement(name, currentIndex);
    setShowModal(false);
  }

  function handleRemoveElement(name: string) {
    onRemoveElement(name);
  }

  return (
    <>
      {showModal && (
        <LocationsSelectionModal
          choosableLocations={choosableLocations}
          handleAddElement={handleAddElement}
          setShowModal={setShowModal}
          showModal={showModal}
        />
      )}
      {routeElements.length < 2 && (
        <>
          <RoutePlannerListElement
            name={routeElements[0] || ''}
            subtitle={'Origin'}
            onPress={() => handlePressElement(0)}
            onRemove={handleRemoveElement}
            onLongPress={() => {}}
            index={0}
          />
          <RoutePlannerListElement
            name={routeElements[1] || ''}
            subtitle={'Destination'}
            onPress={() => handlePressElement(1)}
            onRemove={handleRemoveElement}
            onLongPress={() => {}}
            index={1}
          />
        </>
      )}
      {!showModal && routeElements.length > 1 && (
        <DraggableFlatList
          data={routeElements}
          style={styles.list}
          keyExtractor={(item) => item}
          renderItem={({ item, getIndex, drag, isActive }) => {
            const index = getIndex?.() ?? 0;
            return (
              <>
                <RoutePlannerListElement
                  name={item}
                  onPress={() => handlePressElement(index + 1)}
                  onRemove={handleRemoveElement}
                  onLongPress={drag}
                  subtitle={
                    index === 0
                      ? 'Origin'
                      : index === routeElements.length - 1
                      ? 'Destination'
                      : ''
                  }
                  isActive={isActive}
                  index={index}
                />
                {index !== routeElements.length - 1 && (
                  <View style={styles.seperator}></View>
                )}
              </>
            );
          }}
          onDragEnd={({ data }) => {
            onSwitchElements(data);
          }}
        />
      )}
      {routeElements.length > 1 && routeElements.length < 25 && (
        <Button
          onPress={handlePressButton}
          colorScheme={ColorScheme.neutral}
          style={styles.stopoverButton}
          textStyle={styles.stopoverButtonText}
        >
          Add Stopover
        </Button>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  seperator: {
    width: '45%',
    height: 12,
    alignSelf: 'flex-start',
    borderRightWidth: 2,
    borderColor: GlobalStyles.colors.grayMedium,
  },
  iconContainer: {
    marginVertical: 4,
    paddingVertical: 0,
  },
  icon: {
    justifyContent: 'center',
    marginHorizontal: 'auto',
  },
  stopoverButton: {
    marginHorizontal: 'auto',
    marginTop: 12,
  },
  stopoverButtonText: {
    fontSize: 14,
  },
  list: {
    backgroundColor: GlobalStyles.colors.graySoft,
    maxHeight: 400,
  },
});

export default RoutePlannerList;
