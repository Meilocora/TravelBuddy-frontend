import React, {
  ReactElement,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RefreshControl, View } from 'react-native';
import {
  NavigationProp,
  RouteProp,
  useNavigation,
} from '@react-navigation/native';
import { StyleSheet } from 'react-native';

import { BottomTabsParamList, Icons, StackParamList } from '../../models';
import Popup from '../../components/UI/Popup';
import InfoText from '../../components/UI/InfoText';
import CurrentElementList from '../../components/CurrentElements/CurrentElementList';
import { GlobalStyles } from '../../constants/styles';
import IconButton from '../../components/UI/IconButton';
import FloatingButton from '../../components/UI/FloatingButton';
import { UserContext } from '../../store/user-context';
import Modal from '../../components/UI/Modal';
import { Medium } from '../../models/media';
import { MediumContext } from '../../store/medium-context';
import { deleteMedia, deleteMedium } from '../../utils/http';
import MediaList from '../../components/Images/MediaList';

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
  const [deletingMedium, setDeletingMedium] = useState<Medium | undefined>(
    undefined
  );
  const [deletingMedia, setDeletingMedia] = useState<Medium[] | undefined>(
    undefined
  );
  const [selectionResetKey, setSelectionResetKey] = useState(0);

  const mediumCtx = useContext(MediumContext);
  const userCtx = useContext(UserContext);

  const mediumNavigation =
    useNavigation<NativeStackNavigationProp<StackParamList>>();
  const showMapNavigation = useNavigation<NavigationProp<StackParamList>>();

  function handleClosePopup() {
    setPopupText(null);
  }

  function handleAddMedium() {
    mediumNavigation.navigate('ManageMedium', {
      mediumId: undefined,
    });
  }

  async function deleteMediaHandler() {
    setDeletePending(true);
    try {
      const { error, status } = await deleteMedia(
        deletingMedia!,
        userCtx.userId!
      );
      if (!error && status === 200) {
        const deleteMediaIds = deletingMedia!.map((m) => m.id);
        mediumCtx.deleteMedia(deleteMediaIds);
        mediumCtx.fetchMedia();
        setSelectionResetKey((k) => k + 1);
      } else {
        setError(error!);
        return;
      }
    } catch (error) {
      setError('Could not delete media!');
    }
    setDeletingMedia(undefined);
    setIsDeleting(false);
    setDeletePending(false);
  }

  async function deleteMediumHandler() {
    setDeletePending(true);
    try {
      const { error, status } = await deleteMedium(
        deletingMedium!,
        userCtx.userId!
      );
      if (!error && status === 200) {
        mediumCtx.deleteMedium(deletingMedium!.id);
        mediumCtx.fetchMedia();
      } else {
        setError(error!);
        return;
      }
    } catch (error) {
      setError('Could not delete medium!');
    }
    setIsDeleting(false);
    setDeletePending(false);
  }

  function deleteHandler(medium: Medium) {
    setDeletingMedium(medium);
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
        mediumCtx.fetchMedia();
      }
    }
    activatePopup();
  }, [route.params]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <IconButton icon={Icons.earth} onPress={handlePressEarth} size={32} />
      ),
    });
  }, [navigation]);

  function handlePressEarth() {
    showMapNavigation.navigate('MediaShowMap', {});
  }

  let content;

  if (mediumCtx.media.length === 0) {
    content = <InfoText content='No media found!' />;
  } else {
    content = (
      <MediaList
        onDelete={deleteHandler}
        setDeletingMedia={setDeletingMedia}
        selectionResetKey={selectionResetKey}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={() => mediumCtx.fetchMedia()}
            colors={[GlobalStyles.colors.greenAccent]}
            tintColor={GlobalStyles.colors.greenAccent}
          />
        }
      />
    );
  }

  return (
    <View style={styles.root}>
      {isDeleting && deletingMedium ? (
        <Modal
          title='Are you sure?'
          content={`The ${deletingMedium?.mediumType} will be deleted from this app permanently!`}
          onConfirm={deleteMediumHandler}
          onCancel={closeModalHandler}
          confirmText={deletePending ? 'Deleting...' : 'Delete'}
        />
      ) : (
        isDeleting &&
        deletingMedia && (
          <Modal
            title='Are you sure?'
            content={`The ${deletingMedia.length} media will be deleted from this app permanently!`}
            onConfirm={deleteMediaHandler}
            onCancel={closeModalHandler}
            confirmText={deletePending ? 'Deleting...' : 'Delete'}
          />
        )
      )}
      <CurrentElementList />
      {content}
      {deletingMedia && deletingMedia.length > 0 ? (
        <FloatingButton
          onPress={() => setIsDeleting(true)}
          icon={Icons.delete}
          color={GlobalStyles.colors.error200}
        />
      ) : (
        <FloatingButton onPress={handleAddMedium} icon={Icons.add} />
      )}
      {popupText && <Popup content={popupText} onClose={handleClosePopup} />}
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
