import { ReactElement, useContext, useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import MinorStageSelector from './ManageImage/MinorStageSelector';
import PlaceToVisitSelector from './ManageImage/PlaceToVisitSelector';
import Input from '../UI/form/Input';
import Button from '../UI/Button';
import { ButtonMode, ColorScheme, Icons } from '../../models';
import { GlobalStyles } from '../../constants/styles';
import CountrySelector from '../MajorStage/ManageMajorStage/CountrySelector';
import CountriesSelection from '../Journeys/ManageJourney/CountriesSelection';
import { fetchCustomCountries } from '../../utils/http';
import { CustomCountryContext } from '../../store/custom-country-context';
import IconButton from '../UI/IconButton';

interface ImagesListFiltersProps {
  filterMinorStage: number | undefined;
  setFilterMinorStage: (minorStageId: number | undefined) => void;
  filterPlace: number | undefined;
  setFilterPlace: (placeId: number | undefined) => void;
  onClose: () => void;
  filterCountry: number | undefined;
  setFilterCountry: (countryId: number | undefined) => void;
}

const ImagesListFilters: React.FC<ImagesListFiltersProps> = ({
  filterMinorStage,
  setFilterMinorStage,
  filterPlace,
  setFilterPlace,
  onClose,
  filterCountry,
  setFilterCountry,
}): ReactElement => {
  // TODO: Add timespan (all, 1 year | custom)
  const [openSelection, setOpenSelection] = useState(false);

  const countryCtx = useContext(CustomCountryContext);
  const defaultCountry = countryCtx.customCountries.find(
    (c) => c.id === filterCountry
  );

  const [countryName, setCountryName] = useState<string | undefined>(
    defaultCountry?.name
  );

  useEffect(() => {
    const country = countryCtx.customCountries.find(
      (c) => c.name === countryName
    );
    if (country) {
      setFilterCountry(country.id);
    }
  }, [countryName]);

  function handleDeleteCountry() {
    setCountryName(undefined);
    setFilterCountry(undefined);
  }

  return (
    <>
      {openSelection && (
        <CountriesSelection
          chosenCountries={[countryName || '']}
          onAddHandler={setCountryName}
          onCloseModal={() => setOpenSelection(false)}
          onFetchRequest={fetchCustomCountries}
          top={60}
          singleSelect={true}
        />
      )}
      <View style={styles.container}>
        <View style={styles.row}>
          <MinorStageSelector
            defaultValue={filterMinorStage}
            errors={[]}
            invalid={false}
            onChangeMinorStage={setFilterMinorStage}
          />

          <PlaceToVisitSelector
            defaultValue={filterPlace}
            errors={[]}
            invalid={false}
            onChangePlace={setFilterPlace}
            autoSuggestion={false}
          />
        </View>
        <View style={styles.row}>
          <Pressable
            onPress={() => setOpenSelection((prevValue) => !prevValue)}
            style={{ flex: 1 }}
          >
            <Input
              maxLength={500}
              label='Country'
              textInputConfig={{
                value: countryName,
                readOnly: true,
                textAlign: 'left',
              }}
            />
          </Pressable>
          {countryName && (
            <IconButton
              icon={Icons.delete}
              onPress={handleDeleteCountry}
              style={styles.deleteButton}
              color={GlobalStyles.colors.graySoft}
            />
          )}
        </View>
        <View style={styles.row}>
          <Button
            colorScheme={ColorScheme.neutral}
            onPress={onClose}
            mode={ButtonMode.flat}
            style={{ marginHorizontal: 'auto' }}
          >
            Dismiss
          </Button>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 40,
    width: '90%',
    marginHorizontal: '5%',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: GlobalStyles.colors.graySoft,
    borderWidth: 1,
    borderRadius: 20,
    borderColor: GlobalStyles.colors.grayDark,
    zIndex: 2,
  },
  row: {
    flexDirection: 'row',
  },
  deleteButton: {
    position: 'absolute',
    right: -4,
    bottom: 10,
  },
});

export default ImagesListFilters;
