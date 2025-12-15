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
}

const VideoModal: React.FC<VideoModalProps> = ({ visible, uri, onClose }) => {
  const videoRef = useRef<Video | null>(null);
  const [rotation, setRotation] = useState(0);

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
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
        <View style={styles.rotateButton}>
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
              { transform: [{ rotate: `${rotation}deg` }] },
            ]}
            source={{ uri }}
            useNativeControls
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay={false}
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
    top: 35,
    right: 20,
    zIndex: 10,
  },
  rotateButton: {
    position: 'absolute',
    top: 35,
    left: 20,
    zIndex: 10,
  },
  playerContainer: {
    width: '100%',
    paddingHorizontal: 10,
  },
  video: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
});

export default VideoModal;
