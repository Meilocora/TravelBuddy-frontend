import React, { ReactElement, useEffect, useState } from 'react';
import {
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import OutsidePressHandler from 'react-native-outside-press';

import ListItem from '../../UI/search/ListItem';
import Button from '../../UI/Button';
import { ButtonMode, ColorScheme, SpendingCategory } from '../../../models';
import Input from '../../UI/form/Input';
import { GlobalStyles } from '../../../constants/styles';

interface SpendingCategorySelectorProps {
  onChangeSpendingCategory: (spendingCategory: string) => void;
  invalid: boolean;
  defaultCategory: string;
  errors: string[];
}

const SpendingCategorySelector: React.FC<SpendingCategorySelectorProps> = ({
  onChangeSpendingCategory,
  invalid,
  defaultCategory,
  errors,
}): ReactElement => {
  const [isInvalid, setIsInvalid] = useState<boolean>(invalid);
  const [openSelection, setOpenSelection] = useState(false);
  const [spendingCategory, setSpendingCategory] = useState<string>('');

  useEffect(() => {
    setSpendingCategory(defaultCategory);
  }, [defaultCategory]);

  function handleOpenModal() {
    setOpenSelection(true);
  }

  function handleCloseModal() {
    setOpenSelection(false);
    Keyboard.dismiss();
  }

  function handlePressListElement(item: string) {
    setSpendingCategory(item);
    setOpenSelection(false);
    onChangeSpendingCategory(item);
  }

  function handlePressOutside() {
    setOpenSelection(false);
  }

  return (
    <>
      {openSelection && (
        <OutsidePressHandler
          onOutsidePress={handlePressOutside}
          style={styles.selectionContainer}
        >
          <View style={styles.listContainer}>
            <ScrollView style={styles.list}>
              {Object.values(SpendingCategory).map((item: string) => (
                <ListItem
                  key={item}
                  onPress={handlePressListElement.bind(item)}
                  containerStyles={
                    item === spendingCategory ? styles.chosenType : {}
                  }
                  textStyles={
                    item === spendingCategory ? styles.chosenText : {}
                  }
                >
                  {item}
                </ListItem>
              ))}
            </ScrollView>
            <Button
              colorScheme={ColorScheme.neutral}
              mode={ButtonMode.flat}
              onPress={handleCloseModal}
              style={styles.button}
            >
              Dismiss
            </Button>
          </View>
        </OutsidePressHandler>
      )}
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Pressable onPress={handleOpenModal}>
            <Input
              label='Category'
              maxLength={100}
              errors={errors}
              mandatory
              textInputConfig={{
                value: spendingCategory,
                readOnly: true,
                placeholder: 'Pick Type',
              }}
            />
          </Pressable>
        </View>
        {isInvalid && (
          <View>
            <Text style={styles.errorText}>Please select a Category</Text>
          </View>
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: '50%',
  },
  headerContainer: {
    width: '100%',
  },
  errorText: {
    fontSize: 16,
    color: GlobalStyles.colors.error200,
    fontStyle: 'italic',
  },
  selectionContainer: {
    position: 'absolute',
    top: 70,
    left: -6,
    maxHeight: 200,
    zIndex: 1,
  },
  listContainer: {
    marginHorizontal: 10,
    backgroundColor: GlobalStyles.colors.purpleSoft,
    borderColor: GlobalStyles.colors.grayDark,
    borderWidth: 1,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    zIndex: 1,
  },
  list: {
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: GlobalStyles.colors.grayDark,
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
  },
  chosenType: {
    backgroundColor: GlobalStyles.colors.purpleAccent,
  },
  chosenText: {
    color: GlobalStyles.colors.purpleSoft,
    fontWeight: 'bold',
  },
  button: {
    marginHorizontal: 'auto',
  },
});

export default SpendingCategorySelector;
