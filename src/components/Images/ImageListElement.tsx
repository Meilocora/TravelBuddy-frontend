import * as ScreenOrientation from 'expo-screen-orientation';
import { ReactElement, useEffect, useState } from 'react';
import { StyleSheet, Image, Pressable } from 'react-native';

import { Image as ImageType, CustomMedia } from '../../models/media';
import ImageModal from '../UI/ImageModal';
import IconButton from '../UI/IconButton';
import { Icons } from '../../models';
import { GlobalStyles } from '../../constants/styles';

interface ImageListElementProps {
  image: ImageType;
  index: number;
  images?: ImageType[];
  onDelete?: (image: ImageType) => void;
}

const ImageListElement: React.FC<ImageListElementProps> = ({
  image,
  index,
  images,
  onDelete,
}): ReactElement => {
  const [showModal, setShowModal] = useState(false);

  function handleDelete() {
    setShowModal(false);
    onDelete!(image);
  }

  // TODO: Implement
  //   function handlePressMedia(item: Media) {
  //   if (item.mediaType === 'image') {
  //     // dein ImageModal öffnen
  //     setSelectedImage(item);
  //     setImageModalVisible(true);
  //   } else if (item.media_type === 'video') {
  //     setSelectedVideoUrl(item.url);
  //     setVideoModalVisible(true);
  //   }
  // }

  useEffect(() => {
    console.log('showModal changed:', showModal);
  }, [showModal]);

  return (
    <>
      <ImageModal
        onClose={() => setShowModal(false)}
        visible={showModal}
        image={image}
        images={images && images.length > 1 ? images : undefined}
        initialIndex={index}
        onDelete={onDelete && handleDelete}
      />
      <Pressable style={styles.container} onPress={() => setShowModal(true)}>
        <Image
          source={{ uri: image.url }}
          resizeMode='cover'
          style={styles.image}
        />
      </Pressable>
      {image.favorite && (
        <IconButton
          icon={Icons.heartFilled}
          onPress={() => {}}
          color={GlobalStyles.colors.favorite}
          style={styles.icon}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 1, // Quadratisch
  },
  image: {
    width: '100%',
    height: '100%',
  },
  icon: {
    position: 'absolute',
    top: -5,
    right: -10,
  },
});

export default ImageListElement;
