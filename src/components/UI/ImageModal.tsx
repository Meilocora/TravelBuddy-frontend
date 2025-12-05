import { ReactElement, useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  View,
  StyleSheet,
  Pressable,
  Image,
  useWindowDimensions,
  Text,
} from 'react-native';
import ImageZoom from 'react-native-image-pan-zoom';

import { GlobalStyles } from '../../constants/styles';
import IconButton from './IconButton';
import { Icons, Location, LocationType, StackParamList } from '../../models';
import { Image as ImageType } from '../../models/image';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import { downloadUserImage } from '../../utils/http';

interface ImageModalProps {
  image?: ImageType;
  visible: boolean;
  link: string;
  onClose: () => void;
  onDelete?: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({
  image,
  visible,
  link,
  onClose,
  onDelete,
}): ReactElement => {
  const isFocused = useIsFocused();

  const [showText, setShowText] = useState(true);

  const navigation = useNavigation<NativeStackNavigationProp<StackParamList>>();

  useEffect(() => {
    if (!isFocused && visible) {
      onClose();
    }
  }, [isFocused, visible, onClose]);

  const { width, height } = useWindowDimensions();

  const editNavigation =
    useNavigation<NativeStackNavigationProp<StackParamList>>();

  function handlePressEdit() {
    editNavigation.navigate('ManageImage', { imageId: image!.id });
  }

  function handleClose() {
    setShowText(true);
    onClose();
  }

  function handleShowLocation() {
    // TODO: Use separate screen for images =>
    const location: Location = {
      belonging: 'Undefined',
      locationType: LocationType.activity,
      data: {
        name: '',
        latitude: image!.latitude!,
        longitude: image!.longitude!,
      },
      done: false,
    };

    navigation.navigate('ShowMap', {
      location: location,
      colorScheme: 'complementary',
      customCountryIds: [2],
    });
  }

  async function handleDownload() {
    // const response = await downloadUserImage({ imageUrl: image!.url });
    // if (response.success) {
    //   Alert.alert('Success', 'Image saved to gallery!');
    //   onClose();
    // } else if (response.error) {
    //   Alert.alert('Error', response.error || 'Failed to download image');
    // }
  }

  // TODO: When image => add download, showMap, stage

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
              maxScale={4} // bis 4x Zoom
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
          {image && (
            <View style={styles.detailsContainer}>
              {showText && (
                <Pressable onPress={() => setShowText(false)}>
                  <Text style={styles.description}>{image.description}</Text>
                </Pressable>
              )}
              <View style={styles.buttonsContainer}>
                <IconButton
                  icon={Icons.download}
                  onPress={handleDownload}
                  color={GlobalStyles.colors.graySoft}
                  size={30}
                />
                <IconButton
                  icon={Icons.location}
                  onPress={handleShowLocation}
                  color={GlobalStyles.colors.visited}
                  size={30}
                />
                <IconButton
                  icon={Icons.edit}
                  onPress={handlePressEdit}
                  color={GlobalStyles.colors.edit}
                  size={30}
                />
                {onDelete && (
                  <IconButton
                    icon={Icons.delete}
                    onPress={onDelete}
                    color={GlobalStyles.colors.error200}
                    size={30}
                  />
                )}
              </View>
            </View>
          )}
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
    // fontSize: 24,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ImageModal;
