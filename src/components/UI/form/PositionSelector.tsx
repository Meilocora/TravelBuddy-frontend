import React, { ReactElement, useState } from 'react';
import {
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { GlobalStyles } from '../../../constants/styles';
import ListItem from '../search/ListItem';
import Input from './Input';
import OutsidePressHandler from 'react-native-outside-press';
import { ColorScheme } from '../../../models';

interface PositionSelectorProps {
  onChangePosition: (position: number) => void;
  invalid: boolean;
  positions: number[];
  defaultPosition: number;
  errors: string[];
  colorScheme?: ColorScheme;
}

const PositionSelector: React.FC<PositionSelectorProps> = ({
  onChangePosition,
  invalid,
  positions,
  defaultPosition,
  errors,
  colorScheme = ColorScheme.accent,
}): ReactElement => {
  const [openSelection, setOpenSelection] = useState(false);
  const [position, setPosition] = useState<number>(defaultPosition);

  let activeBg = GlobalStyles.colors.accent200;
  if (colorScheme === ColorScheme.complementary) {
    activeBg = GlobalStyles.colors.complementary200;
  }

  function handleOpenModal() {
    setOpenSelection(true);
  }

  function handleCloseModal() {
    setOpenSelection(false);
    Keyboard.dismiss();
  }

  function handlePressListElement(item: number) {
    setPosition(item);
    onChangePosition(item);
    setOpenSelection(false);
  }

  return (
    <>
      {openSelection && positions.length > 1 && (
        <OutsidePressHandler
          onOutsidePress={handleCloseModal}
          style={styles.selectionContainer}
        >
          <ScrollView style={styles.listContainer} nestedScrollEnabled={true}>
            {positions.length > 0 &&
              positions.map((item) => (
                <ListItem
                  key={item}
                  onPress={() => handlePressListElement(item)}
                  containerStyles={
                    item === position
                      ? { backgroundColor: activeBg }
                      : undefined
                  }
                >
                  {item.toString()}
                </ListItem>
              ))}
          </ScrollView>
        </OutsidePressHandler>
      )}
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Pressable onPress={handleOpenModal}>
            <Input
              maxLength={3}
              label='position'
              errors={errors}
              textInputConfig={{
                value: position.toString(),
                readOnly: true,
                textAlign: 'center',
              }}
            />
          </Pressable>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  outside: {
    flex: 1,
    height: '100%',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  headerContainer: {
    width: 50,
  },
  header: {
    textAlign: 'center',
    fontSize: 20,
    color: GlobalStyles.colors.gray50,
  },
  errorText: {
    fontSize: 16,
    color: GlobalStyles.colors.error200,
    fontStyle: 'italic',
  },
  selectionContainer: {
    position: 'absolute',
    right: 3,
    top: 70,
    backgroundColor: GlobalStyles.colors.gray400,
    zIndex: 1,
  },
  listContainer: {
    maxHeight: 200,
    paddingHorizontal: 4,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    paddingBottom: 2,
    borderWidth: 1,
    borderTopWidth: 0,
  },
  button: {
    marginHorizontal: 'auto',
  },
});

export default PositionSelector;
