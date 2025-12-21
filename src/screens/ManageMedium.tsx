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
import Animated, { FadeInDown } from 'react-native-reanimated';
import Modal from '../components/UI/Modal';
import ErrorOverlay from '../components/UI/ErrorOverlay';
import {
  NavigationProp,
  RouteProp,
  useNavigation,
} from '@react-navigation/native';
import { MediumContext } from '../store/medium-context';
import { Medium, MediumValues } from '../models/media';
import { UserContext } from '../store/user-context';
import { deleteMedium } from '../utils/http';
import MediumForm from '../components/Images/ManageMedia/MediumForm';

interface ManageMediumProps {
  navigation: NativeStackNavigationProp<StackParamList, 'ManageMedium'>;
  route: RouteProp<StackParamList, 'ManageMedium'>;
}

interface ConfirmHandlerProps {
  error?: string;
  status: number;
  medium?: Medium;
}

const ManageMedium: React.FC<ManageMediumProps> = ({
  route,
  navigation,
}): ReactElement => {
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const galleryNavigation =
    useNavigation<NavigationProp<BottomTabsParamList>>();

  const mediumCtx = useContext(MediumContext);
  const userCtx = useContext(UserContext);

  const editedMediumId = route.params?.mediumId;
  let isEditing = !!editedMediumId;

  const selectedMedium = mediumCtx.findMedium(editedMediumId!);

  const initialLat = route.params.lat || selectedMedium?.latitude || undefined;
  const initialLng = route.params.lng || selectedMedium?.longitude || undefined;

  // Empty, when no default values provided
  const [defaultValues, setDefaultValues] = useState<MediumValues>({
    url: selectedMedium?.url || '',
    favorite: selectedMedium?.favorite || false,
    latitude: initialLat,
    longitude: initialLng,
    timestamp: selectedMedium?.timestamp || undefined,
    minorStageId: selectedMedium?.minorStageId || undefined,
    placeToVisitId: selectedMedium?.placeToVisitId || undefined,
    description: selectedMedium?.description || '',
    mediumType: selectedMedium?.mediumType || 'image',
    duration: selectedMedium?.duration || undefined,
    thumbnailUrl: selectedMedium?.thumbnailUrl || undefined,
  });

  async function deleteMediumHandler() {
    try {
      const { error, status } = await deleteMedium(
        selectedMedium!,
        userCtx.userId!
      );
      if (!error && status === 200) {
        const popupText = 'Medium successfully deleted!';
        galleryNavigation.navigate('Gallery', {
          popupText: popupText,
          refresh: true,
        });
      } else {
        setError(error!);
        return;
      }
    } catch (error) {
      setError('Could not delete medium!');
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
        const popupText = 'Medium successfully updated!';
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
        const popupText = 'Medium successfully added!';
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
          content={`The Medium will be deleted from this app permanently!`}
          onConfirm={deleteMediumHandler}
          onCancel={closeModalHandler}
        />
      )}
      {error && <ErrorOverlay message={error} onPress={() => setError(null)} />}
      <Animated.ScrollView entering={FadeInDown}>
        <MediumForm
          key={editedMediumId}
          onCancel={cancelHandler}
          onSubmit={confirmHandler}
          submitButtonLabel={isEditing ? 'Update' : 'Add'}
          defaultValues={isEditing ? defaultValues : undefined}
          isEditing={isEditing}
          editMediumId={editedMediumId}
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

export default ManageMedium;
