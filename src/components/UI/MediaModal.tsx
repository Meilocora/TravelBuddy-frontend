import React, { ReactElement, useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import ImageViewing from 'react-native-image-viewing';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LatLng } from 'react-native-maps';

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

  // intern Index of currently displayed Image
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // Video-Player-State
  const [videoVisible, setVideoVisible] = useState(false);
  const [videoUri, setVideoUri] = useState<string | null>(null);

  // several media or only one
  const allMedia: Medium[] = useMemo(() => {
    if (media && media.length > 0) return media;
    if (medium) return [medium];
    return [];
  }, [media, medium]);

  const currentMedium: Medium | undefined =
    allMedia.length > 0 ? allMedia[currentIndex] : undefined;

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
        return { uri: isVideo && thumb ? thumb : m.url };
      }),
    [allMedia]
  );

  if (!visible || allMedia.length === 0) {
    return null;
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
            <Text style={styles.timestamp}>{currentMedium?.timestamp}</Text>
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
          currentMedium
            ? () => (
                <View style={styles.footer}>
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
                    {currentMedium.mediumType === 'video' && (
                      <IconButton
                        icon={Icons.play}
                        onPress={handlePlayVideo}
                        color={GlobalStyles.colors.graySoft}
                        size={30}
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
                  <Text style={styles.counter}>
                    {currentIndex + 1} / {allMedia.length}
                  </Text>
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
    marginTop: 20,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)',
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

export default MediaModal;
