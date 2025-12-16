import { ReactElement, useEffect, useState } from 'react';
import {
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { ButtonMode, ColorScheme, Icons } from '../../../models';
import { GlobalStyles } from '../../../constants/styles';
import IconButton from '../../UI/IconButton';
import Search from '../Search';
import { getLanguageName, getRemainingLanguages } from '../../../utils';
import ListItem from '../../UI/search/ListItem';
import Button from '../../UI/Button';

interface LanguagesSelectorListProps {
  visible: boolean;
  onCancel: () => void;
  defaultLanguages: string[] | undefined;
  addLanguage: (language: string) => void;
  deleteLanguage: (language: string) => void;
}

const LanguagesSelectorList: React.FC<LanguagesSelectorListProps> = ({
  visible,
  onCancel,
  defaultLanguages,
  addLanguage,
  deleteLanguage,
}): ReactElement => {
  const [sort, setSort] = useState<'asc' | 'desc'>('asc');
  const [search, setSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  let languages = getRemainingLanguages(defaultLanguages);
  if (sort === 'desc') {
    languages = [...languages].sort((a, b) => b.localeCompare(a));
  } else {
    languages = [...languages].sort((a, b) => a.localeCompare(b));
  }

  if (searchTerm !== '') {
    languages = languages.filter((lan) =>
      lan.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  const availableLanguages = languages;

  function handleTapSort() {
    if (sort === 'asc') {
      setSort('desc');
    } else {
      setSort('asc');
    }
  }

  function handleTapSearch() {
    setSearch((prevValue) => !prevValue);
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType='fade'
      onRequestClose={onCancel}
      statusBarTranslucent
    >
      <View style={styles.modalOverlay}>
        <View style={styles.container}>
          <View style={styles.headerContainer}>
            <Text style={styles.header}>Languages</Text>
          </View>
          {defaultLanguages && defaultLanguages?.length > 4 ? (
            <ScrollView style={styles.choseScrollList}>
              {defaultLanguages.map((lan) => (
                <ListItem
                  key={lan}
                  onPress={deleteLanguage}
                  textStyles={styles.chosenListElement}
                  containerStyles={styles.chosenListElementContainer}
                >
                  {getLanguageName(lan) || ''}
                </ListItem>
              ))}
            </ScrollView>
          ) : (
            defaultLanguages && (
              <View style={styles.chosenList}>
                {defaultLanguages.map((lan) => (
                  <ListItem
                    key={lan}
                    onPress={deleteLanguage}
                    textStyles={styles.chosenListElement}
                    containerStyles={styles.chosenListElementContainer}
                  >
                    {getLanguageName(lan) || ''}
                  </ListItem>
                ))}
              </View>
            )
          )}
          <View style={styles.iconButtonsContainer}>
            <IconButton
              icon={Icons.filter}
              onPress={handleTapSort}
              color={GlobalStyles.colors.grayDark}
              style={
                sort === 'desc'
                  ? { transform: [{ rotate: '180deg' }] }
                  : undefined
              }
            />
            <IconButton
              icon={Icons.search}
              onPress={handleTapSearch}
              color={
                search || searchTerm
                  ? GlobalStyles.colors.greenAccent
                  : undefined
              }
            />
          </View>
          {search && (
            <View style={styles.searchContainer}>
              <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
            </View>
          )}
          {availableLanguages.length > 0 && (
            <ScrollView
              style={styles.listContainer}
              nestedScrollEnabled
              scrollEnabled
            >
              {availableLanguages.map((lan) => (
                <ListItem key={lan} onPress={addLanguage}>
                  {lan.trim()}
                </ListItem>
              ))}
            </ScrollView>
          )}
          <Button
            colorScheme={ColorScheme.neutral}
            mode={ButtonMode.flat}
            onPress={onCancel}
            style={styles.dismissButton}
            textStyle={styles.dismissButtonText}
          >
            Dismiss
          </Button>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    height: Dimensions.get('window').height * 0.85,
    width: '90%',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    backgroundColor: GlobalStyles.colors.graySoft,
    borderColor: GlobalStyles.colors.grayMedium,
    borderWidth: 1,
    borderRadius: 20,
    zIndex: 2,
  },
  guestureContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  headerContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    color: GlobalStyles.colors.grayDark,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  chosenList: {
    width: '80%',
  },
  choseScrollList: {
    width: '80%',
    height: 375,
  },
  chosenListElementContainer: {
    borderColor: GlobalStyles.colors.greenAccent,
  },
  chosenListElement: {
    color: GlobalStyles.colors.greenAccent,
  },
  mapButton: {
    backgroundColor: GlobalStyles.colors.grayMedium,
  },
  iconButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginHorizontal: 'auto',
    marginBottom: 10,
  },
  searchContainer: {
    width: '100%',
  },
  listContainer: {
    height: Dimensions.get('window').height * 0.8,
    width: '80%',
    marginHorizontal: 'auto',
    borderBottomWidth: 2,
    borderTopWidth: 2,
  },
  dismissButton: {
    marginHorizontal: 'auto',
  },
  dismissButtonText: {
    color: GlobalStyles.colors.grayMedium,
  },
});

export default LanguagesSelectorList;
