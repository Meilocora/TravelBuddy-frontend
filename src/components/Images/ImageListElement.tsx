import { ReactElement, useContext, useState } from 'react';
import { StyleSheet, Image, Pressable } from 'react-native';

import { Image as ImageType } from '../../models/image';
import ImageModal from '../UI/ImageModal';
import IconButton from '../UI/IconButton';
import { Icons } from '../../models';
import { GlobalStyles } from '../../constants/styles';

interface ImageListElementProps {
  image: ImageType;
  onDelete: (image: ImageType) => void;
}

const ImageListElement: React.FC<ImageListElementProps> = ({
  image,
  onDelete,
}): ReactElement => {
  const [showModal, setShowModal] = useState(false);

  function handleDelete() {
    setShowModal(false);
    onDelete(image);
  }

  return (
    <>
      <ImageModal
        link={image.url}
        onClose={() => setShowModal(false)}
        visible={showModal}
        image={image}
        onDelete={handleDelete}
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
    borderWidth: 0.5,
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
