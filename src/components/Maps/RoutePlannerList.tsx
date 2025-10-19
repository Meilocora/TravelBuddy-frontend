import { ReactElement, useState } from 'react';
import { StyleSheet, View, ScrollView, Modal } from 'react-native';
import DraggableFlatList from 'react-native-draggable-flatlist';

import { GlobalStyles } from '../../constants/styles';
import { ButtonMode, ColorScheme, Location } from '../../models';
import Button from '../UI/Button';
import { generateRandomString } from '../../utils';
import ListItem from '../UI/search/ListItem';
import RoutePlannerListElement from './RoutePlannerListElement';

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

  const choosableLocations = locations
    .map((loc) => loc.data.name)
    .filter((name) => !routeElements.includes(name));

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

  function handleSwitchElements(locs: string[]) {
    onSwitchElements(locs);
  }

  return (
    <>
      {showModal && (
        <Modal
          visible={showModal}
          transparent
          animationType='fade'
          onRequestClose={() => setShowModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.listContainer}>
              <ScrollView style={styles.list}>
                {choosableLocations.map((name: string) => (
                  <ListItem
                    key={generateRandomString()}
                    onPress={() => handleAddElement(name)}
                    containerStyles={styles.listElementContainer}
                    textStyles={styles.listElementText}
                  >
                    {name}
                  </ListItem>
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
      )}
      {routeElements.length < 2 && (
        <>
          <RoutePlannerListElement
            name={routeElements[0] || ''}
            subtitle={'Origin'}
            onPress={() => handlePressElement(0)}
            onRemove={handleRemoveElement}
            onLongPress={() => {}}
          />
          <RoutePlannerListElement
            name={routeElements[1] || ''}
            subtitle={'Destination'}
            onPress={() => handlePressElement(1)}
            onRemove={handleRemoveElement}
            onLongPress={() => {}}
          />
        </>
      )}
      {!showModal && routeElements.length > 1 && (
        <DraggableFlatList
          data={routeElements}
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
      {routeElements.length > 1 && (
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    maxHeight: '70%',
    width: '80%',
    alignItems: 'center',
    paddingTop: 10,
    backgroundColor: GlobalStyles.colors.gray50,
    borderColor: GlobalStyles.colors.gray500,
    borderWidth: 1,
    borderRadius: 20,
    zIndex: 2,
  },
  list: {
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: GlobalStyles.colors.gray500,
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
  },
  listElementContainer: {
    borderColor: GlobalStyles.colors.gray500,
  },
  listElementText: {
    color: GlobalStyles.colors.gray500,
  },
  button: {
    marginHorizontal: 'auto',
  },
  buttonText: {
    color: GlobalStyles.colors.gray500,
  },
  seperator: {
    width: '45%',
    height: 12,
    alignSelf: 'flex-start',
    borderRightWidth: 2,
    borderColor: GlobalStyles.colors.gray500,
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
});

export default RoutePlannerList;
