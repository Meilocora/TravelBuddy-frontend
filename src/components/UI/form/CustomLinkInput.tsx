import { ReactElement, useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';

import Input from './Input';
import { isImageLink } from '../../../utils';
import IconButton from '../IconButton';
import { GlobalStyles } from '../../../constants/styles';
import { Icons } from '../../../models';

interface CustomLinkInputProps {
  input: { value: string; isValid: boolean; errors: string[] };
  onChangeText: (text: string) => void;
  setShowImage: () => void;
}

const CustomLinkInput: React.FC<CustomLinkInputProps> = ({
  input,
  onChangeText,
  setShowImage,
}): ReactElement => {
  const [hasClipboardContent, setHasClipboardContent] = useState(false);

  const checkClipboard = useCallback(async () => {
    const text = await Clipboard.getStringAsync();
    setHasClipboardContent(!!text);
  }, []);

  useEffect(() => {
    checkClipboard();
  }, [checkClipboard]);

  async function handlePasteFromClipboard() {
    const text = await Clipboard.getStringAsync();
    if (text) {
      onChangeText(text);
    }
  }

  return (
    <View style={styles.container}>
      <Input
        label='Link'
        maxLength={500}
        invalid={!input.isValid}
        errors={input.errors}
        textInputConfig={{
          value: input.value,
          onChangeText: onChangeText,
        }}
      />
      <IconButton
        icon={Icons.clipboard}
        onPress={handlePasteFromClipboard}
        color={GlobalStyles.colors.grayDark}
        containerStyle={styles.imageButtonContainer}
        style={
          hasClipboardContent ? styles.imageButton : styles.inactiveImageButton
        }
        size={30}
      />
      {isImageLink(input.value) && (
        <IconButton
          icon={Icons.image}
          onPress={() => setShowImage()}
          color={GlobalStyles.colors.grayDark}
          containerStyle={styles.imageButtonContainer}
          style={styles.imageButton}
          size={30}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  imageButtonContainer: {
    padding: 0,
    marginTop: 20,
  },
  imageButton: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,
    margin: 0,
  },
  inactiveImageButton: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,
    margin: 0,
    opacity: 0.5,
  },
});

export default CustomLinkInput;
