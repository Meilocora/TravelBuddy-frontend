import { ReactElement, useState } from 'react';
import { StyleSheet, Image, Pressable, View } from 'react-native';

import { Medium } from '../../models/media';
import MediaModal from '../UI/MediaModal';
import IconButton from '../UI/IconButton';
import { Icons } from '../../models';
import { GlobalStyles } from '../../constants/styles';

interface MediaListElementProps {
  medium: Medium;
  index: number;
  media?: Medium[];
  onDelete?: (medium: Medium) => void;
}

const MediaListElement: React.FC<MediaListElementProps> = ({
  medium,
  index,
  media,
  onDelete,
}): ReactElement => {
  const [showModal, setShowModal] = useState(false);

  function handleDelete() {
    setShowModal(false);
    onDelete!(medium);
  }

  let url = medium.url;
  if (medium.mediumType === 'video' && medium.thumbnailUrl) {
    url = medium.thumbnailUrl;
  }

  return (
    <>
      <MediaModal
        onClose={() => setShowModal(false)}
        visible={showModal}
        medium={medium}
        media={media && media.length > 1 ? media : undefined}
        initialIndex={index}
        onDelete={onDelete && handleDelete}
      />
      <Pressable style={styles.container} onPress={() => setShowModal(true)}>
        <Image source={{ uri: url }} resizeMode='cover' style={styles.image} />
        {medium.mediumType === 'video' && (
          <View style={styles.iconContainer}>
            <View style={styles.iconWrapper}>
              <IconButton
                icon={Icons.play}
                onPress={() => setShowModal(true)}
                color={GlobalStyles.colors.graySoft}
                containerStyle={styles.playIcon}
                size={22}
              />
            </View>
          </View>
        )}
      </Pressable>
      {medium.favorite && (
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
  iconContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
  },
  iconWrapper: {
    padding: 0,
    margin: 10,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 10,
  },
  playIcon: {
    margin: 0,
    paddingHorizontal: 0,
    paddingVertical: 4,
  },
});

export default MediaListElement;
