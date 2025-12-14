import { ReactElement, useEffect } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  Pressable,
  Image,
  useWindowDimensions,
} from 'react-native';
import ImageZoom from 'react-native-image-pan-zoom';
import { useIsFocused } from '@react-navigation/native';

import { GlobalStyles } from '../../constants/styles';
import IconButton from './IconButton';
import { Icons } from '../../models';

interface LinkImageModalProps {
  visible: boolean;
  link: string;
  onClose: () => void;
}

const LinkImageModal: React.FC<LinkImageModalProps> = ({
  visible,
  link,
  onClose,
}): ReactElement => {
  const isFocused = useIsFocused();

  useEffect(() => {
    if (!isFocused && visible) {
      onClose();
    }
  }, [isFocused, visible, onClose]);

  const { width, height } = useWindowDimensions();

  function handleClose() {
    onClose();
  }

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType='fade'
        onRequestClose={handleClose}
        statusBarTranslucent
      >
        <Pressable style={styles.modalOverlay} onPress={handleClose}>
          <View style={styles.closeButtonContainer}>
            <IconButton
              icon={Icons.close}
              onPress={handleClose}
              color={GlobalStyles.colors.graySoft}
              size={32}
            />
          </View>

          <Pressable
            style={styles.imageContainer}
            onPress={(e) => e.stopPropagation()}
          >
            {/* @ts-ignore: Typdefinition of lib does not know children for some reason */}
            <ImageZoom
              cropWidth={width}
              cropHeight={height}
              imageWidth={width * 0.9}
              imageHeight={height * 0.85}
              minScale={1}
              maxScale={4}
            >
              <Image
                source={{ uri: link }}
                style={{
                  width: width * 0.9,
                  height: height * 0.85,
                }}
                resizeMode='contain'
              />
            </ImageZoom>
          </Pressable>
        </Pressable>
      </Modal>
    </>
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
    top: 35,
    right: 20,
    zIndex: 10,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  description: {
    color: GlobalStyles.colors.graySoft,
    marginBottom: 6,
    maxWidth: '80%',
  },
});

export default LinkImageModal;
