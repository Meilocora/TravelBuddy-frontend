import { ReactElement } from 'react';
import {
  Modal,
  View,
  Image,
  StyleSheet,
  Pressable,
  Dimensions,
} from 'react-native';
import { GlobalStyles } from '../../constants/styles';
import IconButton from './IconButton';
import { Icons } from '../../models';

interface ImageModalProps {
  visible: boolean;
  link: string;
  onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({
  visible,
  link,
  onClose,
}): ReactElement => {
  const { width, height } = Dimensions.get('window');

  return (
    <Modal
      visible={visible}
      transparent
      animationType='fade'
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <View style={styles.closeButtonContainer}>
          <IconButton
            icon={Icons.close}
            onPress={onClose}
            color={GlobalStyles.colors.graySoft}
            size={32}
          />
        </View>
        <Pressable
          style={styles.imageContainer}
          onPress={(e) => e.stopPropagation()}
        >
          <Image
            source={{ uri: link }}
            style={{
              width: width * 0.95,
              height: height * 0.85,
            }}
            resizeMode='contain'
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonContainer: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ImageModal;
