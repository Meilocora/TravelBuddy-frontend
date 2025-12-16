import { ReactElement, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Input from '../../UI/form/Input';
import { FormLimits } from '../../../models';
import { getLanguageCode, getLanguageNames } from '../../../utils';
import LanguagesSelectorList from './LanguagesSelectorList';

interface LanguagesSelectorProps {
  languageCodes: string[] | undefined;
  onChangeLanguages: (languages: string[] | undefined) => void;
}

const LanguagesSelector: React.FC<LanguagesSelectorProps> = ({
  languageCodes,
  onChangeLanguages,
}): ReactElement => {
  const [showModal, setShowModal] = useState(false);

  const trimmedLanguageCodes = languageCodes?.map((code) => code.trim());

  function handleAddLanguage(language: string) {
    const newCode = getLanguageCode(language);
    let newLanguages: string[] | undefined = languageCodes;
    if (newCode) {
      newLanguages = [...(languageCodes || []), newCode];
    }
    onChangeLanguages(newLanguages);
  }

  function handleDeleteLanguage(language: string) {
    const deleteCode = getLanguageCode(language);

    if (deleteCode && trimmedLanguageCodes) {
      const newLanguages = [...trimmedLanguageCodes].filter(
        (lan) => lan !== deleteCode
      );
      onChangeLanguages(newLanguages);
    }
  }

  return (
    <>
      <LanguagesSelectorList
        defaultLanguages={languageCodes}
        addLanguage={handleAddLanguage}
        deleteLanguage={handleDeleteLanguage}
        onCancel={() => setShowModal(false)}
        visible={showModal}
      />
      <Pressable onPress={() => setShowModal(true)} style={styles.container}>
        <Input
          label='Languages'
          maxLength={FormLimits.countryLanguages}
          invalid={false}
          errors={[]}
          textInputConfig={{
            value: getLanguageNames(languageCodes) || '',
            readOnly: true,
          }}
        />
      </Pressable>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default LanguagesSelector;
