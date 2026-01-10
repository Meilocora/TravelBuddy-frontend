import { ReactElement, useContext, useRef, useState } from 'react';
import { Image, StyleSheet, useWindowDimensions, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { ResizeMode, Video } from 'expo-av';

import IconButton from '../IconButton';
import { Icons } from '../../../models';
import { UserContext } from '../../../store/user-context';
import { GlobalStyles } from '../../../constants/styles';
import InAppCameraModal, { CameraCapture } from '../../Images/InAppCameraModal';

interface CustomMediumPickerProps {
  defaultValue: string;
  defaultMediumType?: 'image' | 'video' | undefined;
  favorite: boolean;
  setFavorite: () => void;
  addMedium: (
    url: string,
    mediumType: 'image' | 'video',
    duration?: number,
    lat?: number,
    lng?: number,
    timestamp?: Date
  ) => void;
  editing: boolean;
}

const CustomMediumPicker: React.FC<CustomMediumPickerProps> = ({
  defaultValue,
  defaultMediumType = 'image',
  favorite,
  setFavorite,
  addMedium,
  editing,
}): ReactElement => {
  const videoRef = useRef<Video | null>(null);

  const [url, setUrl] = useState<string | undefined>(defaultValue);
  const [mediumType, setMediumType] = useState<'video' | 'image' | undefined>(
    defaultMediumType
  );
  const [isFav, setIsFav] = useState(favorite);

  const userCtx = useContext(UserContext);

  const { width } = useWindowDimensions();
  const imageSize = width * 0.95;

  const [cameraVisible, setCameraVisible] = useState(false);
  const [cameraMode, setCameraMode] = useState<'photo' | 'video'>('photo');

  function openPhotoCamera() {
    setCameraMode('photo');
    setCameraVisible(true);
  }
  function openVideoCamera() {
    setCameraMode('video');
    setCameraVisible(true);
  }

  function handleCaptured(capture: CameraCapture) {
    let lat: number | undefined;
    let lng: number | undefined;

    if (
      userCtx.currentLocation &&
      typeof userCtx.currentLocation.latitude === 'number' &&
      typeof userCtx.currentLocation.longitude === 'number'
    ) {
      lat = userCtx.currentLocation.latitude;
      lng = userCtx.currentLocation.longitude;
    }

    if (capture.type === 'image') {
      setMediumType('image');
      setUrl(capture.uri);
      addMedium(capture.uri, 'image', undefined, lat, lng);
    } else {
      setMediumType('video');
      setUrl(capture.uri);
      addMedium(capture.uri, 'video', capture.duration, lat, lng);
    }
  }

  async function handlePickMedium() {
    // Request permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
      return null;
    }

    // Pick medium
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      quality: 0.9,
      exif: true,
    });

    if (result.canceled) {
      return null;
    }

    const asset = result.assets[0];
    const url = asset.uri;
    const exif = asset.exif;
    const type = asset.type;

    let lat: number | undefined;
    let lng: number | undefined;
    let timestamp: Date | undefined;

    if (type === 'image') {
      if (exif?.GPSLatitude != null && exif?.GPSLongitude != null) {
        lat = exif.GPSLatitude;
        lng = exif.GPSLongitude;
      }

      // Extract timestamp from EXIF data
      if (exif?.DateTimeOriginal) {
        // Format: "YYYY:MM:DD HH:MM:SS"
        const dateStr = exif.DateTimeOriginal.replace(
          /^(\d{4}):(\d{2}):(\d{2})/,
          '$1-$2-$3'
        );
        timestamp = new Date(dateStr);
      }

      setMediumType('image');
      setUrl(url);
      addMedium(url, 'image', undefined, lat, lng, timestamp);
    } else if (type === 'video') {
      const asset = result.assets[0];
      const duration = asset.duration;

      if (exif?.GPSLatitude != null && exif?.GPSLongitude != null) {
        lat = exif.GPSLatitude;
        lng = exif.GPSLongitude;
      }

      // Extract timestamp from EXIF data
      if (exif?.DateTimeOriginal) {
        // Format: "YYYY:MM:DD HH:MM:SS"
        const dateStr = exif.DateTimeOriginal.replace(
          /^(\d{4}):(\d{2}):(\d{2})/,
          '$1-$2-$3'
        );
        timestamp = new Date(dateStr);
      }

      if (asset.assetId) {
        // Permission für Media Library einholen
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== 'granted') return undefined;

        const info = await MediaLibrary.getAssetInfoAsync(asset.assetId);

        if (info.creationTime) {
          timestamp = new Date(info.creationTime);
        }
        if (info.modificationTime) {
          timestamp = new Date(info.modificationTime);
        }
      }

      setMediumType('video');
      setUrl(url);
      addMedium(
        url,
        'video',
        duration ? duration : undefined,
        lat,
        lng,
        timestamp
      );
    }
  }

  function handlePressFavorite() {
    setIsFav((prevValue) => !prevValue);
    setFavorite();
  }

  return (
    <View style={styles.container}>
      <InAppCameraModal
        visible={cameraVisible}
        mode={cameraMode}
        onClose={() => setCameraVisible(false)}
        onCaptured={handleCaptured}
      />

      <View
        style={[styles.imageContainer, { width: imageSize, height: imageSize }]}
      >
        {url ? (
          <View style={styles.mediumContainer}>
            {mediumType === 'image' ? (
              <Image
                source={{ uri: url }}
                resizeMode='cover'
                style={{ flex: 1 }}
              />
            ) : (
              <Video
                ref={videoRef}
                style={styles.video}
                source={{ uri: url }}
                useNativeControls
                resizeMode={ResizeMode.CONTAIN}
                shouldPlay={false}
              />
            )}
            <IconButton
              icon={isFav ? Icons.heartFilled : Icons.heartOutline}
              onPress={handlePressFavorite}
              color='red'
              containerStyle={styles.icon}
              size={46}
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
            onPress={handlePickMedium}
            color={
              url ? GlobalStyles.colors.graySoft : GlobalStyles.colors.grayDark
            }
            size={32}
          />
          <IconButton
            icon={Icons.cameraOutline}
            onPress={openPhotoCamera}
            color={
              url ? GlobalStyles.colors.graySoft : GlobalStyles.colors.grayDark
            }
            size={32}
          />
          <IconButton
            icon={Icons.videocam}
            onPress={openVideoCamera}
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
  mediumContainer: {
    flex: 1,
    backgroundColor: GlobalStyles.colors.grayMedium,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  icon: {
    position: 'absolute',
    zIndex: 2,
    bottom: 10,
    right: 10,
  },
  buttonsRow: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
  },
});

export default CustomMediumPicker;
