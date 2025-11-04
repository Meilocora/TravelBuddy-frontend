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
  colorscheme: ColorScheme;
}

const TransportTypeSelector: React.FC<TransportTypeSelectorProps> = ({
  onChangeTransportType,
  invalid,
  defaultType,
  errors,
  colorscheme,
}): ReactElement => {
  const [isInvalid, setIsInvalid] = useState<boolean>(invalid);
  const [openSelection, setOpenSelection] = useState(false);
  const [transportType, setTransportType] = useState<string>('');

  let bg = GlobalStyles.colors.amberSoft;
  let bgChosen = GlobalStyles.colors.amberAccent;
  let textChosen = GlobalStyles.colors.amberSoft;
  if (colorscheme === ColorScheme.complementary) {
    bg = GlobalStyles.colors.purpleSoft;
    bgChosen = GlobalStyles.colors.purpleAccent;
    textChosen = bg = GlobalStyles.colors.purpleSoft;
  }

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

  // TODO: gray backdrop!

  return (
    <>
      {openSelection && (
        <View style={styles.outerSelectionContainer}>
          <OutsidePressHandler
            onOutsidePress={handlePressOutside}
            style={styles.selectionContainer}
          >
            <Animated.View
              style={[styles.listContainer, { backgroundColor: bg }]}
              entering={FadeInUp}
              exiting={FadeOutUp}
            >
              <ScrollView style={styles.list} nestedScrollEnabled>
                {Object.values(TransportationType).map((item: string) => (
                  <ListItem
                    key={generateRandomString()}
                    onPress={handlePressListElement.bind(item)}
                    containerStyles={
                      item === transportType
                        ? { backgroundColor: bgChosen }
                        : {}
                    }
                    textStyles={
                      item === transportType ? { color: textChosen } : {}
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
  errorText: {
    fontSize: 16,
    color: GlobalStyles.colors.error200,
    fontStyle: 'italic',
  },
  outerSelectionContainer: {
    position: 'absolute',
    top: 72,
    width: '100%',
  },
  selectionContainer: {
    marginHorizontal: 'auto',
    zIndex: 1,
  },
  listContainer: {
    width: 150,
    height: 310,
    elevation: 5,
    borderColor: GlobalStyles.colors.grayMedium,
    borderWidth: 1,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    zIndex: 1,
  },
  list: {
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: GlobalStyles.colors.grayMedium,
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
  },
  button: {
    marginHorizontal: 'auto',
  },
});

export default TransportTypeSelector;
