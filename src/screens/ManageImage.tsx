import { ReactElement, useContext, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  BottomTabsParamList,
  Icons,
  FormLimits,
  StackParamList,
} from '../models';
import IconButton from '../components/UI/IconButton';
import { GlobalStyles } from '../constants/styles';
import { formatDateTimeString } from '../utils';
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
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
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
  const { triggerRefresh } = useAppData();
  const editedImageId = route.params?.imageId;
  let isEditing = !!editedImageId;

  const selectedImage = imageCtx.findImage(editedImageId!);

  // Empty, when no default values provided
  const [defaultValues, setDefaultValues] = useState<ImageValues>({
    url: selectedImage?.url || '',
    favorite: selectedImage?.favorite || false,
    latitude: selectedImage?.latitude || undefined,
    longitude: selectedImage?.longitude || undefined,
    timestamp: selectedImage?.timestamp
      ? formatDateTimeString(selectedImage.timestamp)!
      : undefined,
    minorStageId: selectedImage?.minorStageId || undefined,
    placeToVisitId: selectedImage?.placeToVisitId || undefined,
    description: selectedImage?.description || '',
  });

  // useFocusEffect(
  //   useCallback(() => {
  //     // JourneyValues set, when screen is focused
  //     setDefaultValues({
  //       name: selectedJourney?.name || '',
  //       description: selectedJourney?.description || '',
  //       scheduled_start_time: selectedJourney?.scheduled_start_time
  //         ? formatDateString(selectedJourney.scheduled_start_time)!
  //         : null,
  //       scheduled_end_time: selectedJourney?.scheduled_end_time
  //         ? formatDateString(selectedJourney.scheduled_end_time)!
  //         : null,
  //       budget: selectedJourney?.costs.budget || 0,
  //       spent_money: selectedJourney?.costs.spent_money || 0,
  //       countries: selectedJourney?.countries
  //         ? formatCountrynamesToString(selectedJourney!.countries)
  //         : '',
  //     });

  //     return () => {
  //       // Clean up function, when screen is unfocused
  //       // reset JourneyValues
  //       setDefaultValues({
  //         name: '',
  //         description: '',
  //         scheduled_start_time: null,
  //         scheduled_end_time: null,
  //         budget: 0,
  //         spent_money: 0,
  //         countries: '',
  //       });
  //       // reset journeyId in navigation params for BottomTab
  //       navigation.setParams({ journeyId: undefined });
  //     };
  //   }, [selectedJourney])
  // );

  async function deleteImageHandler() {
    try {
      const { error, status } = await deleteImage(
        selectedImage!,
        userCtx.userId!
      );
      if (!error && status === 200) {
        triggerRefresh();
        const popupText = 'Image successfully deleted!';
        galleryNavigation.navigate('Gallery', { popupText: popupText });
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
    galleryNavigation.navigate('Gallery');
  }

  async function confirmHandler({ status, error }: ConfirmHandlerProps) {
    if (isEditing) {
      if (error) {
        setError(error);
        return;
      } else if (status === 200) {
        triggerRefresh();
        const popupText = 'Image successfully updated!';
        galleryNavigation.navigate('Gallery', { popupText: popupText });
      }
    } else {
      if (error) {
        setError(error);
        return;
      } else if (status === 201) {
        triggerRefresh();
        const popupText = 'Image successfully added!';
        galleryNavigation.navigate('Gallery', { popupText: popupText });
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
