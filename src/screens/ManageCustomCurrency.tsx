import React, {
  ReactElement,
  useContext,
  useLayoutEffect,
  useState,
} from 'react';
import { View, StyleSheet } from 'react-native';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import {
  BottomTabsParamList,
  CustomCurrencyValues,
  FormLimits,
  Icons,
  StackParamList,
} from '../models';
import ErrorOverlay from '../components/UI/ErrorOverlay';
import MainGradient from '../components/UI/LinearGradients/MainGradient';
import { useAppData } from '../hooks/useAppData';
import { UserContext } from '../store/user-context';
import { deleteCurrency, ManageCurrencyProps } from '../utils/http/currency';
import CustomCurrencyForm from '../components/Currencies/CustomCurrencyForm';
import Modal from '../components/UI/Modal';
import IconButton from '../components/UI/IconButton';
import { GlobalStyles } from '../constants/styles';
import HeaderTitle from '../components/UI/HeaderTitle';

interface ManageCustomCurrencyProps {
  navigation: NativeStackNavigationProp<StackParamList, 'ManageCustomCurrency'>;
  route: RouteProp<StackParamList, 'ManageCustomCurrency'>;
}

const ManageCustomCurrency: React.FC<ManageCustomCurrencyProps> = ({
  route,
  navigation,
}): ReactElement => {
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const allJourneysNavigation =
    useNavigation<NativeStackNavigationProp<BottomTabsParamList>>();

  const userCtx = useContext(UserContext);
  const { triggerRefresh } = useAppData();

  const currencyId = route.params.currencyId;
  let isEditing = !!currencyId;

  const selectedCurrency = currencyId
    ? userCtx.currencies.find((c) => c.id === currencyId)
    : undefined;

  // Empty, when no default values provided
  const [defaultValues, setDefaultValues] = useState<CustomCurrencyValues>({
    code: selectedCurrency?.code || '',
    name: selectedCurrency?.name || '',
    symbol: selectedCurrency?.symbol || '',
    conversionRate: selectedCurrency?.conversionRate || 1,
  });

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTintColor: GlobalStyles.colors.grayDark,
      headerTitle: () => (
        <HeaderTitle title={`${currencyId ? 'Manage' : 'Add'} Currency`} />
      ),
    });
  }, [navigation, isEditing]);

  async function deleteCurrencyHandler() {
    try {
      const { error, status } = await deleteCurrency(selectedCurrency!.id!);
      if (!error && status === 200) {
        triggerRefresh();
        const popupText = 'Currency successfully deleted!';
        allJourneysNavigation.navigate('AllJourneys', {
          popupText: popupText,
        });
      } else {
        setError(error!);
        return;
      }
    } catch (error) {
      setError('Could not delete currency!');
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
    allJourneysNavigation.navigate('AllJourneys', {});
  }

  async function confirmHandler({ status, error }: ManageCurrencyProps) {
    if (isEditing) {
      if (error) {
        setError(error);
        return;
      } else {
        triggerRefresh();
        const popupText = 'Currency successfully updated!';
        allJourneysNavigation.navigate('AllJourneys', {
          popupText: popupText,
        });
      }
    } else {
      if (error) {
        setError(error);
        return;
      } else {
        triggerRefresh();
        const popupText = 'Currency successfully added!';
        allJourneysNavigation.navigate('AllJourneys', {
          popupText: popupText,
        });
      }
    }
  }

  return (
    <>
      <MainGradient />
      {isDeleting && (
        <Modal
          title='Are you sure?'
          content={`This Currency will be deleted permanently`}
          onConfirm={deleteCurrencyHandler}
          onCancel={closeModalHandler}
        />
      )}
      <View style={styles.root}>
        {error && (
          <ErrorOverlay message={error} onPress={() => setError(null)} />
        )}
        <CustomCurrencyForm
          key={currencyId}
          onCancel={cancelHandler}
          onSubmit={confirmHandler}
          submitButtonLabel={isEditing ? 'Update' : 'Add'}
          defaultValues={defaultValues}
          editCurrencyId={currencyId}
          isEditing={isEditing}
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
      </View>
    </>
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

export default ManageCustomCurrency;
