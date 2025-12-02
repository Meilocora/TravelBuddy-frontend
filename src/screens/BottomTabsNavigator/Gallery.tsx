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

interface GalleryProps {
  navigation: NativeStackNavigationProp<BottomTabsParamList, 'Gallery'>;
  route: RouteProp<BottomTabsParamList, 'Gallery'>;
}

const Gallery: React.FC<GalleryProps> = ({
  navigation,
  route,
}): ReactElement => {
  const [popupText, setPopupText] = useState<string | null>();
  const { isFetching, errors, triggerRefresh } = useAppData();

  const imagesCtx = useContext(ImageContext);

  const imageNavigation =
    useNavigation<NativeStackNavigationProp<StackParamList>>();

  // Fetch all data here, because the users always starts on this screen
  function handleClosePopup() {
    setPopupText(null);
  }

  function handleAddImage() {
    imageNavigation.navigate('ManageImage', {
      imageId: undefined,
    });
  }

  function handlePressReload() {
    triggerRefresh();
  }

  // TODO: TopRight should stay Userprofile => make Add Button at the bottom
  // TODO: TopLeft => Globus Button to see a Map with all Images

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <IconButton icon={Icons.add} onPress={handleAddImage} size={32} />
      ),
    });
  }, [navigation]);

  let content;
  if (imagesCtx.images.length === 0) {
    content = <InfoText content='No Images found!' />;
  } else {
    content = (
      <ImagesList
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={triggerRefresh}
            colors={[GlobalStyles.colors.greenAccent]}
            tintColor={GlobalStyles.colors.greenAccent}
          />
        }
      />
    );
  }

  return (
    <View style={styles.root}>
      <CurrentElementList />
      {popupText && <Popup content={popupText} onClose={handleClosePopup} />}
      {content}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  indicator: {
    marginVertical: 'auto',
  },
});

export default Gallery;
