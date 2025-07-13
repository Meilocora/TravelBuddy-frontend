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

import ListItem from '../UI/search/ListItem';
import { generateRandomString } from '../../utils';
import Button from '../UI/Button';
import { ButtonMode, ColorScheme, TransportationType } from '../../models';
import Input from '../UI/form/Input';
import { GlobalStyles } from '../../constants/styles';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';

interface TransportTypeSelectorProps {
  onChangeTransportType: (transportType: string) => void;
  invalid: boolean;
  defaultType: string;
  errors: string[];
}

const TransportTypeSelector: React.FC<TransportTypeSelectorProps> = ({
  onChangeTransportType,
  invalid,
  defaultType,
  errors,
}): ReactElement => {
  const [isInvalid, setIsInvalid] = useState<boolean>(invalid);
  const [openSelection, setOpenSelection] = useState(false);
  const [transportType, setTransportType] = useState<string>('');

  useEffect(() => {
    setTransportType(defaultType);
  }, [defaultType]);

  function handleOpenModal() {
    setOpenSelection(true);
  }

  function handleCloseModal() {
    setOpenSelection(false);
    Keyboard.dismiss();
  }

  function handlePressListElement(item: string) {
    setTransportType(item);
    setOpenSelection(false);
    onChangeTransportType(item);
  }

  function handlePressOutside() {
    setOpenSelection(false);
  }

  return (
    <>
      {openSelection && (
        <View style={styles.outerSelectionContainer}>
          <OutsidePressHandler
            onOutsidePress={handlePressOutside}
            style={styles.selectionContainer}
          >
            <Animated.View
              style={styles.listContainer}
              entering={FadeInUp}
              exiting={FadeOutUp}
            >
              <ScrollView style={styles.list} nestedScrollEnabled>
                {Object.values(TransportationType).map((item: string) => (
                  <ListItem
                    key={generateRandomString()}
                    onPress={handlePressListElement.bind(item)}
                    containerStyles={
                      item === transportType ? styles.chosenType : {}
                    }
                    textStyles={item === transportType ? styles.chosenText : {}}
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
            </Animated.View>
          </OutsidePressHandler>
        </View>
      )}
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Pressable onPress={handleOpenModal}>
            <Input
              label='Transporttype'
              maxLength={100}
              errors={errors}
              mandatory
              textInputConfig={{
                value: defaultType || transportType,
                readOnly: true,
                placeholder: 'Pick Type',
              }}
            />
          </Pressable>
        </View>
        {isInvalid && (
          <View>
            <Text style={styles.errorText}>Please select a Transporttype</Text>
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
  },
  headerContainer: {
    width: '100%',
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
  outerSelectionContainer: {
    position: 'absolute',
    top: 80,
    width: '100%',
  },
  selectionContainer: {
    marginHorizontal: 'auto',
    zIndex: 1,
  },
  listContainer: {
    width: 150,
    height: 200,
    backgroundColor: GlobalStyles.colors.gray700,
    borderColor: GlobalStyles.colors.gray100,
    borderWidth: 1,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    zIndex: 1,
  },
  list: {
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: GlobalStyles.colors.gray100,
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
  },
  chosenType: {
    backgroundColor: GlobalStyles.colors.accent200,
  },
  chosenText: {
    color: GlobalStyles.colors.gray50,
    fontWeight: 'bold',
  },
  button: {
    marginHorizontal: 'auto',
  },
});

export default TransportTypeSelector;
