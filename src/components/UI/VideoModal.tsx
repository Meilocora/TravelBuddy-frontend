import React, { useRef, useState } from 'react';
import { Modal, View, StyleSheet } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import IconButton from './IconButton';
import { Icons } from '../../models';
import { GlobalStyles } from '../../constants/styles';

interface VideoModalProps {
  visible: boolean;
  uri: string;
  onClose: () => void;
  shouldPlay?: boolean;
}

const VideoModal: React.FC<VideoModalProps> = ({
  visible,
  uri,
  onClose,
  shouldPlay = false,
}) => {
  const videoRef = useRef<Video | null>(null);
  const [isRotated, setIsRotated] = useState(false);

  const handleRotate = () => {
    setIsRotated((prev) => !prev);
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType='fade'
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.closeButton}>
          <IconButton
            icon={Icons.close}
            onPress={onClose}
            color={GlobalStyles.colors.graySoft}
            size={32}
          />
        </View>
        <View
          style={[
            styles.rotateButton,
            isRotated && { transform: [{ scaleX: -1 }] },
          ]}
        >
          <IconButton
            icon={Icons.refresh}
            onPress={handleRotate}
            color={GlobalStyles.colors.graySoft}
            size={32}
          />
        </View>
        <View style={styles.playerContainer}>
          <Video
            ref={videoRef}
            style={[
              styles.video,
              { transform: [{ rotateZ: `${isRotated ? 90 : 0}deg` }] },
            ]}
            source={{ uri }}
            useNativeControls
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay={shouldPlay}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
  },
  rotateButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 10,
  },
  playerContainer: {
    width: '130%',
    paddingHorizontal: 10,
  },
  video: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
});

export default VideoModal;
