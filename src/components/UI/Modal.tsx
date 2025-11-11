import { ReactElement } from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';

import { GlobalStyles } from '../../constants/styles';
import { ButtonMode, ColorScheme } from '../../models';
import Button from './Button';

interface ModalProps {
  title: string;
  content: string;
  confirmText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  positiveConfirm?: boolean;
  containerStyle?: ViewStyle;
}

const Modal: React.FC<ModalProps> = ({
  title,
  content,
  confirmText = 'Delete',
  onConfirm,
  onCancel,
  positiveConfirm,
  containerStyle,
}): ReactElement => {
  return (
    <BlurView intensity={85} tint='dark' style={styles.blurcontainer}>
      <Animated.View
        entering={FadeInDown}
        exiting={FadeOutDown}
        style={[styles.container, containerStyle]}
      >
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.content}>{content}</Text>
        <View style={styles.buttonContainer}>
          <Button
            style={styles.button}
            mode={ButtonMode.flat}
            onPress={onCancel!}
            colorScheme={ColorScheme.neutral}
          >
            Cancel
          </Button>
          {onConfirm && (
            <Button
              onPress={onConfirm}
              colorScheme={
                positiveConfirm ? ColorScheme.primary : ColorScheme.error
              }
              style={styles.button}
            >
              {confirmText}
            </Button>
          )}
        </View>
      </Animated.View>
    </BlurView>
  );
};

const styles = StyleSheet.create({
  blurcontainer: {
    flex: 1,
    height: '100%',
    width: '100%',
    overflow: 'hidden',
    zIndex: 1,
    ...StyleSheet.absoluteFillObject,
  },
  container: {
    marginHorizontal: 'auto',
    marginVertical: 'auto',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: '80%',
    padding: 24,
    backgroundColor: GlobalStyles.colors.graySoft,
    borderRadius: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: GlobalStyles.colors.grayDark,
    marginVertical: 8,
  },
  content: {
    fontSize: 18,
    color: GlobalStyles.colors.grayMedium,
    flexWrap: 'wrap',
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    marginHorizontal: 4,
  },
});

export default Modal;
