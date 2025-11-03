import { ReactElement, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  StyleSheet,
  View,
} from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import OutsidePressHandler from 'react-native-outside-press';

import Input from '../form/Input';
import Button from '../Button';
import { ColorScheme } from '../../../models';
import { generateRandomString } from '../../../utils';
import InfoText from '../InfoText';
import { GlobalStyles } from '../../../constants/styles';
import ListItem from './ListItem';
import ErrorOverlay from '../ErrorOverlay';

interface SearchElementProps<T, U> {
  onFetchRequest: (
    searchTerm: string
  ) => Promise<{ items?: T[]; status: number; error?: string }>;
  onAddRequest: (
    item: string
  ) => Promise<{ addedItem?: U; status: number; error?: string }>;
  onAddHandler: (addedItem: U) => void;
  searchTermLabel: string;
  onOutsidePress: () => void;
}

const SearchElement = <T, U>({
  onFetchRequest,
  onAddRequest,
  onAddHandler,
  searchTermLabel,
  onOutsidePress,
}: SearchElementProps<T, U>): ReactElement => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [fetchedData, setFetchedData] = useState<T[]>([]);
  const [debouncedSearchTerm, setDebouncedSearchTerm] =
    useState<string>(searchTerm);

  // Activate Timer, so that the API is not called on every key stroke
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 1000);

    return () => {
      clearTimeout(timer);
    };
  }, [searchTerm]);

  // Fetch data
  useEffect(() => {
    async function fetchData() {
      if (debouncedSearchTerm !== '' && debouncedSearchTerm.length > 1) {
        const { items, error } = await onFetchRequest(debouncedSearchTerm);

        if (!error && items) {
          setFetchedData(items);
        } else if (error) {
          setError(error);
        }
      } else {
        setFetchedData([]);
      }
      setIsLoading(false);
      Keyboard.dismiss();
    }

    fetchData();
  }, [debouncedSearchTerm]);

  function inputChangedHandler(value: string) {
    setIsLoading(true);
    setSearchTerm(value);
  }

  function handlePressListElement(chosenItem: string) {
    setSearchTerm(chosenItem);
  }

  async function handleAddItem() {
    const { error, status, addedItem } = await onAddRequest(searchTerm);
    if (error) {
      setError(error);
      return;
    } else if (addedItem && status === 201) {
      onAddHandler(addedItem);
      setSearchTerm('');
      setDebouncedSearchTerm('');
    }
  }

  let content: ReactElement | null = null;

  if (error) {
    content = <ErrorOverlay message={error} onPress={() => setError(null)} />;
  } else if (isLoading && debouncedSearchTerm.length > 1) {
    content = (
      <ActivityIndicator size='large' color={GlobalStyles.colors.amberAccent} />
    );
  } else if (
    debouncedSearchTerm.length > 1 &&
    !isLoading &&
    fetchedData.length > 0 &&
    fetchedData[0] !== searchTerm
  ) {
    content = (
      <FlatList
        style={styles.list}
        contentContainerStyle={{ paddingBottom: 10, paddingTop: 5 }}
        data={fetchedData}
        renderItem={({ item }) => (
          <ListItem
            key={generateRandomString()}
            onPress={() => handlePressListElement(item as string)}
          >
            {item as string}
          </ListItem>
        )}
      />
    );
  } else if (
    debouncedSearchTerm.length > 1 &&
    !isLoading &&
    fetchedData.length === 0
  ) {
    content = <InfoText content='No items found' />;
  }

  return (
    <BlurView intensity={95} tint='dark' style={styles.blurContainer}>
      <Animated.View
        entering={FadeInUp}
        exiting={FadeOutUp}
        style={styles.outerContainer}
      >
        <OutsidePressHandler onOutsidePress={onOutsidePress}>
          <View style={styles.innerContainer}>
            <Input
              errors={[]}
              invalid={false}
              maxLength={100}
              label={searchTermLabel}
              textInputConfig={{
                value: searchTerm,
                onChangeText: inputChangedHandler,
              }}
            />
            <Button
              onPress={handleAddItem}
              colorScheme={ColorScheme.accent}
              style={{
                marginHorizontal: 10,
                alignSelf: 'flex-end',
                marginBottom: 12,
              }}
            >
              Add
            </Button>
          </View>
          {content}
        </OutsidePressHandler>
      </Animated.View>
    </BlurView>
  );
};

const styles = StyleSheet.create({
  blurContainer: {
    flex: 1,
    zIndex: 1,
    ...StyleSheet.absoluteFillObject,
  },
  outerContainer: {
    marginTop: 70,
    padding: 10,
    width: '90%',
    marginHorizontal: 'auto',
    backgroundColor: GlobalStyles.colors.graySoft,
    borderWidth: 1,
    borderColor: GlobalStyles.colors.grayDark,
    borderRadius: 10,
  },
  innerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: 75,
    marginHorizontal: 10,
    marginVertical: 10,
  },
  list: {
    marginHorizontal: 15,
    paddingHorizontal: 10,
    maxHeight: '90%',
    maxWidth: 290,
  },
});

export default SearchElement;
