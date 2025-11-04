import { ReactElement } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';

import { CheckLog, generateRandomString } from '../../utils';
import { GlobalStyles } from '../../constants/styles';
import Button from '../UI/Button';
import { ColorScheme } from '../../models';
import OutsidePressHandler from 'react-native-outside-press';

interface ValidationModalProps {
  checkLogs: CheckLog[];
  onClose: () => void;
  onTapItem: (item: CheckLog) => void;
}

const ValidationModal: React.FC<ValidationModalProps> = ({
  checkLogs,
  onClose,
  onTapItem,
}): ReactElement => {
  return (
    <Animated.View
      style={styles.outerContainer}
      entering={FadeInDown}
      exiting={FadeOutUp}
    >
      <OutsidePressHandler onOutsidePress={onClose} style={{ zIndex: 2 }}>
        <Animated.View style={styles.innerContainer}>
          <Text style={styles.title}>Validation Log</Text>
          <Text style={styles.titleDescription}>
            - {checkLogs.length} problems found -
          </Text>
          <Animated.ScrollView
            style={styles.logContainer}
            scrollEnabled
            nestedScrollEnabled
          >
            {checkLogs.map((item, index) => (
              <Pressable
                key={generateRandomString()}
                style={({ pressed }) => pressed && styles.pressed}
                android_ripple={{ color: GlobalStyles.colors.grayMedium }}
                onPress={() => onTapItem(item)}
              >
                <View style={styles.logElement}>
                  <Text style={styles.subtitle}>
                    {index + 1}) {item.subtitle}
                  </Text>
                  <Text style={styles.description}>{item.description}</Text>
                </View>
              </Pressable>
            ))}
          </Animated.ScrollView>
          <Button
            colorScheme={ColorScheme.neutral}
            onPress={onClose}
            style={styles.button}
          >
            Close
          </Button>
        </Animated.View>
      </OutsidePressHandler>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    zIndex: 1,
    top: 0,
    height: 1500,
    width: '100%',
    position: 'absolute',
    backgroundColor: 'rgba(30, 30, 30, 0.5)',
  },
  innerContainer: {
    alignContent: 'stretch',
    marginHorizontal: 10,
    marginTop: '15%',
    paddingHorizontal: 15,
    paddingVertical: 5,
    backgroundColor: GlobalStyles.colors.grayMedium,
    borderColor: GlobalStyles.colors.graySoft,
    borderRadius: 20,
    borderWidth: 1,
    maxHeight: 600,
  },
  logContainer: {
    maxHeight: '80%',
  },
  logElement: {
    marginVertical: 4,
  },
  pressed: {
    opacity: 0.5,
  },
  title: {
    fontSize: 22,
    textAlign: 'center',
    fontWeight: 'bold',
    color: GlobalStyles.colors.graySoft,
    marginBottom: 5,
  },
  titleDescription: {
    fontStyle: 'italic',
    color: GlobalStyles.colors.graySoft,
    opacity: 0.7,
    textAlign: 'center',
  },
  subtitle: {
    color: GlobalStyles.colors.graySoft,
    textDecorationLine: 'underline',
  },
  description: {
    color: GlobalStyles.colors.graySoft,
    opacity: 0.8,
  },
  button: {
    marginTop: 10,
    alignSelf: 'flex-start',
    marginHorizontal: 'auto',
  },
});

export default ValidationModal;
