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
import { deleteMedium } from '../../utils/http';
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
      {isDeleting && (
        <Modal
          title='Are you sure?'
          content={`The ${deletingMedium?.mediumType} will be deleted from this app permanently!`}
          onConfirm={deleteMediumHandler}
          onCancel={closeModalHandler}
          confirmText={deletePending ? 'Deleting...' : 'Delete'}
        />
      )}
      <CurrentElementList />
      {content}
      <FloatingButton onPress={handleAddMedium} />
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
