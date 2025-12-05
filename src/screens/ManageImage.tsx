import { ReactElement, useContext, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import {
  BottomTabsParamList,
  Icons,
  FormLimits,
  StackParamList,
} from '../models';
import IconButton from '../components/UI/IconButton';
import { GlobalStyles } from '../constants/styles';
import { deleteImage } from '../utils/http';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Modal from '../components/UI/Modal';
import ErrorOverlay from '../components/UI/ErrorOverlay';
import {
  NavigationProp,
  RouteProp,
  useNavigation,
} from '@react-navigation/native';
import { useAppData } from '../hooks/useAppData';
import { ImageContext } from '../store/image-context';
import { Image, ImageValues } from '../models/image';
import ImageForm from '../components/Images/ManageImage/ImageForm';
import { UserContext } from '../store/user-context';

interface ManageImageProps {
  navigation: NativeStackNavigationProp<StackParamList, 'ManageImage'>;
  route: RouteProp<StackParamList, 'ManageImage'>;
}

interface ConfirmHandlerProps {
  error?: string;
  status: number;
  image?: Image;
}

const ManageImage: React.FC<ManageImageProps> = ({
  route,
  navigation,
}): ReactElement => {
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const galleryNavigation =
    useNavigation<NavigationProp<BottomTabsParamList>>();

  const imageCtx = useContext(ImageContext);
  const userCtx = useContext(UserContext);

  const editedImageId = route.params?.imageId;
  let isEditing = !!editedImageId;

  const selectedImage = imageCtx.findImage(editedImageId!);

  // Empty, when no default values provided
  const [defaultValues, setDefaultValues] = useState<ImageValues>({
    url: selectedImage?.url || '',
    favorite: selectedImage?.favorite || false,
    latitude: selectedImage?.latitude || undefined,
    longitude: selectedImage?.longitude || undefined,
    timestamp: selectedImage?.timestamp || undefined,
    minorStageId: selectedImage?.minorStageId || undefined,
    placeToVisitId: selectedImage?.placeToVisitId || undefined,
    description: selectedImage?.description || '',
  });

  async function deleteImageHandler() {
    try {
      const { error, status } = await deleteImage(
        selectedImage!,
        userCtx.userId!
      );
      if (!error && status === 200) {
        const popupText = 'Image successfully deleted!';
        galleryNavigation.navigate('Gallery', {
          popupText: popupText,
          refresh: true,
        });
      } else {
        setError(error!);
        return;
      }
    } catch (error) {
      setError('Could not delete image!');
    }
    setIsDeleting(false);
    return;
  }

  function deleteHandler() {
    setIsDeleting(true);
  }

  function closeModalHandler() {
    setIsDeleting(false);
  }

  function cancelHandler() {
    navigation.navigate('BottomTabsNavigator', {
      screen: 'Gallery',
    });
  }

  async function confirmHandler({ status, error }: ConfirmHandlerProps) {
    if (isEditing) {
      if (error) {
        setError(error);
        return;
      } else {
        const popupText = 'Image successfully updated!';
        navigation.navigate('BottomTabsNavigator', {
          screen: 'Gallery',
          params: { popupText: popupText, refresh: true },
        });
      }
    } else {
      if (error) {
        setError(error);
        return;
      } else {
        const popupText = 'Image successfully added!';
        navigation.navigate('BottomTabsNavigator', {
          screen: 'Gallery',
          params: { popupText: popupText, refresh: true },
        });
      }
    }
  }

  return (
    <View style={styles.root}>
      {isDeleting && (
        <Modal
          title='Are you sure?'
          content={`The Image will be deleted from this app permanently!`}
          onConfirm={deleteImageHandler}
          onCancel={closeModalHandler}
        />
      )}
      {error && <ErrorOverlay message={error} onPress={() => setError(null)} />}
      <Animated.ScrollView entering={FadeInDown}>
        <ImageForm
          onCancel={cancelHandler}
          onSubmit={confirmHandler}
          submitButtonLabel={isEditing ? 'Update' : 'Add'}
          defaultValues={isEditing ? defaultValues : undefined}
          isEditing={isEditing}
          editImageId={editedImageId}
        />
        {isEditing && (
          <View style={styles.btnContainer}>
            <IconButton
              icon={Icons.delete}
              color={GlobalStyles.colors.error200}
              onPress={deleteHandler}
              size={FormLimits.deleteSize}
            />
          </View>
        )}
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  btnContainer: {
    alignItems: 'center',
  },
});

export default ManageImage;
