import React, { ReactElement, useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import ImageViewing from 'react-native-image-viewing';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LatLng } from 'react-native-maps';

import { GlobalStyles } from '../../constants/styles';
import IconButton from './IconButton';
import { Icons, ImageLocation, StackParamList } from '../../models';
import { Image as ImageType } from '../../models/media';
import { downloadUserImage } from '../../utils/http';

interface ImageModalProps {
  image?: ImageType;
  images?: ImageType[];
  initialIndex?: number;

  visible: boolean;
  onClose: () => void;

  onDelete?: (image: ImageType) => void;
  onCalcRoute?: (coords: LatLng, image: ImageType) => void;
}

const ImageModal: React.FC<ImageModalProps> = ({
  image,
  images,
  initialIndex = 0,
  visible,
  onClose,
  onDelete,
  onCalcRoute,
}): ReactElement | null => {
  const isFocused = useIsFocused();
  const navigation = useNavigation<NativeStackNavigationProp<StackParamList>>();

  // intern Index of currently displayed Image
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // several images or only one
  const allImages: ImageType[] = useMemo(() => {
    if (images && images.length > 0) return images;
    if (image) return [image];
    return [];
  }, [images, image]);

  const currentImage: ImageType | undefined =
    allImages.length > 0 ? allImages[currentIndex] : undefined;

  useEffect(() => {
    if (!isFocused && visible) {
      onClose();
    }
  }, [isFocused, visible, onClose]);

  // ImageViewing needs { uri: string }[]
  const viewerImages = useMemo(
    () => allImages.map((img) => ({ uri: img.url })),
    [allImages]
  );

  if (!visible || allImages.length === 0) {
    return null;
  }

  async function handleDownload() {
    if (!currentImage) return;
    const response = await downloadUserImage({ image: currentImage });
    if (response.success) {
      Alert.alert('Success', 'Image successfully saved to gallery!');
      onClose();
    } else if (response.error) {
      Alert.alert('Error', response.error || 'Download failed');
    }
  }

  function handleShowLocation() {
    if (
      !currentImage ||
      currentImage.latitude == null ||
      currentImage.longitude == null
    ) {
      return;
    }

    const location: ImageLocation = {
      id: currentImage.id,
      latitude: currentImage.latitude,
      longitude: currentImage.longitude,
      url: currentImage.url,
      description: currentImage.description,
      favourite: currentImage.favorite,
    };

    onClose();
    navigation.navigate('ImagesShowMap', { imageLocation: location });
  }

  function handleCalcRouteInternal() {
    if (
      !currentImage ||
      currentImage.latitude == null ||
      currentImage.longitude == null ||
      !onCalcRoute
    ) {
      return;
    }

    onCalcRoute(
      {
        latitude: currentImage.latitude,
        longitude: currentImage.longitude,
      },
      currentImage
    );
    onClose();
  }

  function handleDelete() {
    if (!currentImage || !onDelete) return;
    onDelete(currentImage);
  }

  function handleEdit() {
    if (!currentImage) return;
    navigation.navigate('ManageImage', { imageId: currentImage.id });
  }

  return (
    <ImageViewing
      images={viewerImages}
      imageIndex={currentIndex}
      visible={visible}
      onRequestClose={onClose}
      onImageIndexChange={setCurrentIndex}
      swipeToCloseEnabled
      doubleTapToZoomEnabled
      backgroundColor='#000000F0'
      presentationStyle='fullScreen'
      animationType='none'
      HeaderComponent={() => (
        <View style={styles.header}>
          <Text style={styles.timestamp}>{currentImage?.timestamp}</Text>
          <IconButton
            icon={Icons.close}
            onPress={onClose}
            color={GlobalStyles.colors.graySoft}
            size={30}
            style={styles.closeIcon}
          />
        </View>
      )}
      FooterComponent={
        currentImage
          ? () => (
              <View style={styles.footer}>
                {!!currentImage.description && (
                  <Text style={styles.description}>
                    {currentImage.description}
                  </Text>
                )}
                <View style={styles.buttonsRow}>
                  <IconButton
                    icon={Icons.download}
                    onPress={handleDownload}
                    color={GlobalStyles.colors.graySoft}
                    size={28}
                  />
                  {currentImage.latitude != null &&
                    currentImage.longitude != null && (
                      <IconButton
                        icon={Icons.location}
                        onPress={handleShowLocation}
                        color={GlobalStyles.colors.visited}
                        size={28}
                      />
                    )}
                  {onCalcRoute && (
                    <IconButton
                      icon={Icons.routePlanner}
                      onPress={handleCalcRouteInternal}
                      color={GlobalStyles.colors.graySoft}
                      size={28}
                    />
                  )}
                  <IconButton
                    icon={Icons.edit}
                    onPress={handleEdit}
                    color={GlobalStyles.colors.edit}
                    size={28}
                  />
                  {onDelete && (
                    <IconButton
                      icon={Icons.delete}
                      onPress={handleDelete}
                      color={GlobalStyles.colors.error200}
                      size={28}
                    />
                  )}
                </View>
                <Text style={styles.counter}>
                  {currentIndex + 1} / {allImages.length}
                </Text>
              </View>
            )
          : undefined
      }
    />
  );
};

const styles = StyleSheet.create({
  header: {
    marginTop: 40,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timestamp: {
    color: GlobalStyles.colors.graySoft,
    fontStyle: 'italic',
  },
  closeIcon: {
    position: 'absolute',
    right: 0,
    // top: 0,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerHint: {
    color: GlobalStyles.colors.graySoft,
    fontSize: 12,
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    paddingTop: 8,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  description: {
    color: GlobalStyles.colors.graySoft,
    textAlign: 'center',
    marginBottom: 8,
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  counter: {
    color: GlobalStyles.colors.graySoft,
    textAlign: 'center',
    marginTop: 8,
    fontSize: 12,
  },
});

export default ImageModal;
