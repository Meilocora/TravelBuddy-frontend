import React, { ReactElement, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import ImageViewing from 'react-native-image-viewing';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LatLng } from 'react-native-maps';
import * as ImageManipulator from 'expo-image-manipulator';

import { GlobalStyles } from '../../constants/styles';
import IconButton from './IconButton';
import { Icons, MediumLocation, StackParamList } from '../../models';
import { Medium } from '../../models/media';
import { downloadUserMedium } from '../../utils/http';
import VideoModal from './VideoModal';

interface MediuaModalProps {
  medium?: Medium;
  media?: Medium[];
  initialIndex?: number;

  visible: boolean;
  onClose: () => void;

  onDelete?: (medium: Medium) => void;
  onCalcRoute?: (coords: LatLng, medium: Medium) => void;
}

const MediaModal: React.FC<MediuaModalProps> = ({
  medium,
  media,
  initialIndex = 0,
  visible,
  onClose,
  onDelete,
  onCalcRoute,
}): ReactElement | null => {
  const isFocused = useIsFocused();
  const navigation = useNavigation<NativeStackNavigationProp<StackParamList>>();

  const { height: screenHeight } = useWindowDimensions();

  // intern Index of currently displayed Image
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // Cache for rotated URIs
  const [rotatedCache, setRotatedCache] = useState<Record<string, string>>({});

  const [isRotatedShown, setIsRotatedShown] = useState<Record<string, boolean>>(
    {}
  );
  const [isRotating, setIsRotating] = useState(false);

  // Video-Player-State
  const [videoVisible, setVideoVisible] = useState(false);
  const [videoUri, setVideoUri] = useState<string | null>(null);

  // several media or only one
  const allMedia: Medium[] = useMemo(() => {
    if (media && media.length > 0) return media;
    if (medium) return [medium];
    return [];
  }, [media, medium]);

  let currentMedium: Medium | undefined =
    allMedia.length > 0 ? allMedia[currentIndex] : undefined;

  function handleImageIndexChange(newIndex: number) {
    setCurrentIndex(newIndex);
  }

  useEffect(() => {
    if (!isFocused && visible) {
      onClose();
    }
  }, [isFocused, visible, onClose]);

  // ImageViewing expects { uri: string }[]
  // for videos the thumbNail is used
  const viewerImages = useMemo(
    () =>
      allMedia.map((m) => {
        const isVideo = m.mediumType === 'video';
        const thumb = (m as any).thumbnailUrl as string | undefined;

        const rotatedUri =
          m.mediumType === 'image' && isRotatedShown[m.id]
            ? rotatedCache[m.id]
            : undefined;

        const uri = isVideo && thumb ? thumb : rotatedUri ?? m.url;
        return { uri };
      }),
    [allMedia, rotatedCache, isRotatedShown]
  );

  if (!visible || allMedia.length === 0) {
    return null;
  }

  async function toggleRotate(m: Medium) {
    if (m.mediumType !== 'image') return;

    const id = m.id;

    // Wenn aktuell rotiert angezeigt: einfach zurückschalten (KEIN neues manipulateAsync)
    if (isRotatedShown[id]) {
      setIsRotatedShown((prev) => ({ ...prev, [id]: false }));
      return;
    }

    // Wenn wir schon eine rotierte Version haben: nur anzeigen
    const cached = rotatedCache[id];
    if (cached) {
      setIsRotatedShown((prev) => ({ ...prev, [id]: true }));
      return;
    }

    // Sonst: einmalig rotierte Version erzeugen + anzeigen
    setIsRotating(true);
    try {
      const result = await ImageManipulator.manipulateAsync(
        m.url,
        [{ rotate: 90 }, { resize: { width: 2048 } }],
        { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
      );

      setRotatedCache((prev) => ({ ...prev, [id]: result.uri }));
      setIsRotatedShown((prev) => ({ ...prev, [id]: true }));
    } finally {
      setIsRotating(false);
    }
  }

  async function handleDownload() {
    if (!currentMedium) return;
    const response = await downloadUserMedium({ medium: currentMedium });
    if (response.success) {
      Alert.alert(
        'Success',
        `${currentMedium.mediumType} successfully saved to gallery!`
      );
      onClose();
    } else if (response.error) {
      Alert.alert('Error', response.error || 'Download failed');
    }
  }

  function handleShowLocation() {
    if (
      !currentMedium ||
      currentMedium.latitude == null ||
      currentMedium.longitude == null
    ) {
      return;
    }

    const location: MediumLocation = {
      id: currentMedium.id,
      mediumType: currentMedium.mediumType,
      latitude: currentMedium.latitude,
      longitude: currentMedium.longitude,
      url: currentMedium.url,
      description: currentMedium.description,
      favourite: currentMedium.favorite,
    };

    onClose();
    navigation.navigate('MediaShowMap', { mediumLocation: location });
  }

  function handleCalcRouteInternal() {
    if (
      !currentMedium ||
      currentMedium.latitude == null ||
      currentMedium.longitude == null ||
      !onCalcRoute
    ) {
      return;
    }

    onCalcRoute(
      {
        latitude: currentMedium.latitude,
        longitude: currentMedium.longitude,
      },
      currentMedium
    );
    onClose();
  }

  function handleDelete() {
    if (!currentMedium || !onDelete) return;
    onDelete(currentMedium);
  }

  function handleEdit() {
    if (!currentMedium) return;
    navigation.navigate('ManageMedium', { mediumId: currentMedium.id });
  }

  function handlePlayVideo() {
    if (!currentMedium) return;

    if (currentMedium.mediumType !== 'video') return;

    setVideoUri(currentMedium.url);
    setVideoVisible(true);
  }

  return (
    <>
      <VideoModal
        visible={videoVisible}
        uri={videoUri ?? ''}
        onClose={() => setVideoVisible(false)}
        shouldPlay={true}
      />
      <ImageViewing
        images={viewerImages}
        imageIndex={initialIndex}
        visible={visible}
        onRequestClose={onClose}
        onImageIndexChange={handleImageIndexChange}
        swipeToCloseEnabled
        doubleTapToZoomEnabled
        backgroundColor='#000000F0'
        presentationStyle='fullScreen'
        animationType='none'
        HeaderComponent={
          currentMedium
            ? () => (
                <View style={styles.header}>
                  {currentMedium &&
                  currentMedium.mediumType === 'image' &&
                  !isRotating ? (
                    <IconButton
                      icon={Icons.refresh}
                      onPress={() => toggleRotate(currentMedium)}
                      style={
                        isRotatedShown[currentMedium.id]
                          ? styles.rotateBackIcon
                          : styles.rotateIcon
                      }
                      color={GlobalStyles.colors.graySoft}
                    />
                  ) : (
                    currentMedium &&
                    currentMedium.mediumType === 'image' &&
                    isRotating && (
                      <View style={styles.loaderWrap}>
                        <ActivityIndicator
                          color={GlobalStyles.colors.graySoft}
                          size={24}
                        />
                      </View>
                    )
                  )}
                  <Text style={styles.timestamp}>
                    {currentMedium?.timestamp}
                  </Text>
                  <IconButton
                    icon={Icons.close}
                    onPress={onClose}
                    color={GlobalStyles.colors.graySoft}
                    size={30}
                    style={styles.closeIcon}
                  />
                </View>
              )
            : undefined
        }
        FooterComponent={
          currentMedium
            ? () => (
                <View style={styles.footer}>
                  {currentMedium.mediumType === 'video' && (
                    <View
                      style={[
                        styles.iconWrapper,
                        {
                          top: -screenHeight / 2 + 45,
                        },
                      ]}
                    >
                      <IconButton
                        icon={Icons.play}
                        onPress={handlePlayVideo}
                        style={styles.playIcon}
                        size={60}
                        color={GlobalStyles.colors.graySoft}
                      />
                    </View>
                  )}
                  {!!currentMedium.description && (
                    <Text style={styles.description}>
                      {currentMedium.description}
                    </Text>
                  )}
                  <View style={styles.buttonsRow}>
                    <IconButton
                      icon={Icons.download}
                      onPress={handleDownload}
                      color={GlobalStyles.colors.graySoft}
                      size={28}
                    />
                    {onCalcRoute && (
                      <IconButton
                        icon={Icons.routePlanner}
                        onPress={handleCalcRouteInternal}
                        color={GlobalStyles.colors.graySoft}
                        size={28}
                      />
                    )}
                    {currentMedium.latitude != null &&
                      currentMedium.longitude != null && (
                        <IconButton
                          icon={Icons.location}
                          onPress={handleShowLocation}
                          color={GlobalStyles.colors.visited}
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
                  {allMedia.length > 1 && (
                    <Text style={styles.counter}>
                      {currentIndex + 1} / {allMedia.length}
                    </Text>
                  )}
                </View>
              )
            : undefined
        }
      />
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  rotateIcon: {
    position: 'absolute',
    left: 0,
  },
  rotateBackIcon: {
    position: 'absolute',
    left: 0,
    transform: [{ scaleX: -1 }],
  },
  loaderWrap: {
    position: 'absolute',
    left: 0,
    marginHorizontal: 8,
    padding: 6,
  },
  timestamp: {
    color: GlobalStyles.colors.graySoft,
    fontStyle: 'italic',
  },
  closeIcon: {
    position: 'absolute',
    right: 0,
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
    paddingBottom: 10,
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
  iconWrapper: {
    padding: 0,
    margin: 10,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 30,
    position: 'absolute',
    left: '50%',
    transform: [{ translateX: -40 }],
  },
  playIcon: {
    margin: 0,
    paddingHorizontal: 0,
    paddingVertical: 4,
  },
});

export default MediaModal;
