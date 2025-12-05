import { ReactElement, useContext, useState } from 'react';
import { Image, StyleSheet, useWindowDimensions, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

import IconButton from '../IconButton';
import { Icons } from '../../../models';
import { isImageLink } from '../../../utils';
import { UserContext } from '../../../store/user-context';
import { GlobalStyles } from '../../../constants/styles';

interface CustomImagePickerProps {
  defaultValue: string;
  favorite: boolean;
  setFavorite: () => void;
  addImage: (url: string, lat?: number, lng?: number) => void;
  editing: boolean;
}

const CustomImagePicker: React.FC<CustomImagePickerProps> = ({
  defaultValue,
  favorite,
  setFavorite,
  addImage,
  editing,
}): ReactElement => {
  const [url, setUrl] = useState<string | undefined>(
    isImageLink(defaultValue) ? defaultValue : undefined
  );
  const [isFav, setIsFav] = useState(favorite);

  const userCtx = useContext(UserContext);

  const { width } = useWindowDimensions();
  const imageSize = width * 0.95;

  async function handlePickImage() {
    // Request permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
      return null;
    }

    // Pick Image
    const result = await ImagePicker.launchImageLibraryAsync({
      // mediaTypes: ImagePicker.MediaTypeOptions.Images,
      mediaTypes: ['images'],
      quality: 0.9,
    });

    if (result.canceled) {
      return null;
    }

    const url = result.assets[0].uri;

    setUrl(url);
    addImage(url);
  }

  async function handleTakePhoto() {
    // Request camera permissions
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== 'granted') {
      alert('Sorry, we need camera permissions to make this work!');
      return null;
    }

    // Launch Camera
    const result = await ImagePicker.launchCameraAsync({
      // mediaTypes: ImagePicker.MediaTypeOptions.Images,
      mediaTypes: ['images'],
      quality: 0.8,
      exif: true,
    });

    if (result.canceled) {
      return null;
    }

    const url = result.assets[0].uri;
    const exif = result.assets[0].exif;

    let lat: number | undefined;
    let lng: number | undefined;

    if (exif?.GPSLatitude != null && exif?.GPSLongitude != null) {
      lat = exif.GPSLatitude;
      lng = exif.GPSLongitude;
    } else if (
      userCtx.currentLocation &&
      typeof userCtx.currentLocation.latitude === 'number' &&
      typeof userCtx.currentLocation.longitude === 'number'
    ) {
      lat = userCtx.currentLocation.latitude;
      lng = userCtx.currentLocation.longitude;
    }

    addImage(url, lat, lng);
    setUrl(url);
  }

  function handlePressFavorite() {
    setIsFav((prevValue) => !prevValue);
    setFavorite();
  }

  return (
    <View style={styles.container}>
      <View
        style={[styles.imageContainer, { width: imageSize, height: imageSize }]}
      >
        {url ? (
          <View style={{ flex: 1 }}>
            <Image
              source={{ uri: url }}
              resizeMode='cover'
              style={{ flex: 1 }}
            />
            <IconButton
              icon={isFav ? Icons.heartFilled : Icons.heartOutline}
              onPress={handlePressFavorite}
              color='red'
              containerStyle={styles.icon}
              size={32}
            />
          </View>
        ) : (
          <View style={{ flex: 1 }}>
            <Image
              source={require('../../../../assets/image_picker.png')}
              resizeMode='cover'
              style={{ flex: 1, width: '100%', height: '100%', opacity: 0.5 }}
            />
          </View>
        )}
      </View>
      {!editing && (
        <View style={styles.buttonsRow}>
          <IconButton
            icon={Icons.folderOpen}
            onPress={handlePickImage}
            color={
              url ? GlobalStyles.colors.graySoft : GlobalStyles.colors.grayDark
            }
            size={32}
          />
          <IconButton
            icon={Icons.cameraOutline}
            onPress={handleTakePhoto}
            color={
              url ? GlobalStyles.colors.graySoft : GlobalStyles.colors.grayDark
            }
            size={32}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, marginTop: 40, marginBottom: 20 },
  imageContainer: {
    marginHorizontal: 'auto',
    borderWidth: 1,
    borderRadius: 25,
    overflow: 'hidden',
  },
  icon: {
    position: 'absolute',
    zIndex: 2,
    bottom: 6,
    right: 6,
  },
  buttonsRow: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
  },
});

export default CustomImagePicker;
