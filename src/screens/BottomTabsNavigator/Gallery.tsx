import React, {
  ReactElement,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RefreshControl, View } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { StyleSheet } from 'react-native';

import ErrorOverlay from '../../components/UI/ErrorOverlay';
import { BottomTabsParamList, Icons, StackParamList } from '../../models';
import Popup from '../../components/UI/Popup';
import InfoText from '../../components/UI/InfoText';
import { StagesContext } from '../../store/stages-context';
import CurrentElementList from '../../components/CurrentElements/CurrentElementList';
import { GlobalStyles } from '../../constants/styles';
import Animated from 'react-native-reanimated';
import { useAppData } from '../../hooks/useAppData';
import { ImageContext } from '../../store/image-context';
import IconButton from '../../components/UI/IconButton';
import ImagesList from '../../components/Images/ImagesList';
import FloatingButton from '../../components/UI/FloatingButton';
import { UserContext } from '../../store/user-context';
import { deleteImage } from '../../utils/http';
import { Image } from '../../models/image';
import Modal from '../../components/UI/Modal';

interface GalleryProps {
  navigation: NativeStackNavigationProp<BottomTabsParamList, 'Gallery'>;
  route: RouteProp<BottomTabsParamList, 'Gallery'>;
}

const Gallery: React.FC<GalleryProps> = ({
  navigation,
  route,
}): ReactElement => {
  const [popupText, setPopupText] = useState<string | null>();
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletePending, setDeletePending] = useState(false);
  const [deletingImage, setDeletingImage] = useState<Image | undefined>(
    undefined
  );

  const imagesCtx = useContext(ImageContext);
  const userCtx = useContext(UserContext);

  const imageNavigation =
    useNavigation<NativeStackNavigationProp<StackParamList>>();

  function handleClosePopup() {
    setPopupText(null);
  }

  function handleAddImage() {
    imageNavigation.navigate('ManageImage', {
      imageId: undefined,
    });
  }

  // TODO: TopLeft => Globus Button to see a Map with all Images

  async function deleteImageHandler() {
    setDeletePending(true);
    try {
      const { error, status } = await deleteImage(
        deletingImage!,
        userCtx.userId!
      );
      if (!error && status === 200) {
        imagesCtx.deleteImage(deletingImage!.id);
        imagesCtx.fetchImages();
      } else {
        setError(error!);
        return;
      }
    } catch (error) {
      setError('Could not delete image!');
    }
    setIsDeleting(false);
    setDeletePending(false);
  }

  function deleteHandler(image: Image) {
    setDeletingImage(image);
    setIsDeleting(true);
  }

  function closeModalHandler() {
    setIsDeleting(false);
  }

  useEffect(() => {
    function activatePopup() {
      if (route.params?.popupText) {
        setPopupText(route.params?.popupText);
      }
      if (route.params?.refresh) {
        imagesCtx.fetchImages();
      }
    }
    activatePopup();
  }, [route.params]);

  useLayoutEffect(() => {
    navigation.setOptions({});
  }, [navigation]);

  let content;

  if (imagesCtx.images.length === 0) {
    content = <InfoText content='No Images found!' />;
  } else {
    content = (
      <ImagesList
        onDelete={deleteHandler}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={() => imagesCtx.fetchImages()}
            colors={[GlobalStyles.colors.greenAccent]}
            tintColor={GlobalStyles.colors.greenAccent}
          />
        }
      />
    );
  }

  return (
    <View style={styles.root}>
      {isDeleting && (
        <Modal
          title='Are you sure?'
          content={`The Image will be deleted from this app permanently!`}
          onConfirm={deleteImageHandler}
          onCancel={closeModalHandler}
          confirmText={deletePending ? 'Deleting...' : 'Delete'}
        />
      )}
      <CurrentElementList />
      {content}
      <FloatingButton onPress={handleAddImage} />
      {popupText && <Popup content={popupText} onClose={handleClosePopup} />}
      {/* {isFetching && (
        <Animated.View style={styles.indicatorContainer}>
          <ActivityIndicator
            size={80}
            color={GlobalStyles.colors.greenAccent}
            style={styles.indicator}
          />
        </Animated.View>
      )} */}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  indicatorContainer: {
    backgroundColor: GlobalStyles.colors.graySoftSemi,
    opacity: 0.8,
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  indicator: { marginVertical: 'auto' },
});

export default Gallery;
