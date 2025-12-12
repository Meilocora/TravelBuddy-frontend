import React, { ReactElement, useContext, useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  Text,
  StyleProp,
  TextStyle,
} from 'react-native';
import OutsidePressHandler from 'react-native-outside-press';

import ListItem from '../UI/search/ListItem';
import { generateRandomString } from '../../utils';
import Button from '../UI/Button';
import {
  ButtonMode,
  ColorScheme,
  Journey,
  MajorStage,
  MapType,
} from '../../models';
import { GlobalStyles } from '../../constants/styles';
import { StagesContext } from '../../store/stages-context';

export interface StageData {
  stageType: 'Journey' | 'MajorStage' | 'MinorStage';
  id: number;
  name: string;
}

interface MapScopeSelectorProps {
  onChangeMapScope: (mapScope: StageData) => void;
  journey: Journey;
  value: StageData;
  mapType: MapType;
}

const MapScopeSelector: React.FC<MapScopeSelectorProps> = ({
  onChangeMapScope,
  journey,
  value,
  mapType,
}): ReactElement => {
  const [openSelection, setOpenSelection] = useState({
    majorStages: false,
    minorStages: false,
  });
  const [mapScopeList, setMapScopeList] = useState<StageData[]>([]);

  const stagesCtx = useContext(StagesContext);

  let majorStagesData: StageData[] = [];
  let minorStagesData: StageData[] = [];

  let subtitle: StyleProp<TextStyle> = {
    fontSize: 14,
    fontStyle: 'italic',
    fontWeight: 'bold',
    textAlign: 'center',
    color: GlobalStyles.colors.grayDark,
  };
  if (mapType !== 'standard') {
    subtitle.color = GlobalStyles.colors.graySoft;
  }

  useEffect(() => {
    function updateMapScopeList() {
      if (journey?.majorStages) {
        for (const majorStage of journey.majorStages) {
          majorStagesData.push({
            stageType: 'MajorStage',
            id: majorStage.id,
            name: majorStage.title,
          });
        }
      } else {
        return;
      }
      if (value.stageType !== 'Journey') {
        let majorStage: MajorStage;
        if (value.stageType === 'MajorStage') {
          majorStage = stagesCtx.findMajorStage(value.id)!;
        } else if (value.stageType === 'MinorStage') {
          majorStage = stagesCtx.findMinorStagesMajorStage(value.id)!;
        }
        if (majorStage!.minorStages) {
          for (const minorStage of majorStage!.minorStages) {
            minorStagesData.push({
              stageType: 'MinorStage',
              id: minorStage.id,
              name: minorStage.title,
            });
          }
        }
      }
      setMapScopeList([value, ...majorStagesData, ...minorStagesData]);
    }

    updateMapScopeList();
  }, [journey, value]);

  let selectedJourneyName: string;
  let selectedMajorStageName: string;
  let selectedMinorStageName: string;

  if (value.stageType === 'Journey') {
    selectedJourneyName = value.name;
  } else if (value.stageType === 'MajorStage') {
    selectedJourneyName = stagesCtx.findMajorStagesJourney(value.id)!.name;
    selectedMajorStageName = value.name;
  } else if (value.stageType === 'MinorStage') {
    const selectedMajorStage = stagesCtx.findMinorStagesMajorStage(value.id)!;
    selectedJourneyName = stagesCtx.findMajorStagesJourney(
      selectedMajorStage.id
    )!.name;
    selectedMajorStageName = selectedMajorStage.title;
    selectedMinorStageName = stagesCtx.findMinorStage(value.id)!.title;
  }

  const selectableMajorStages = [
    ...mapScopeList.filter(
      (item) => item.stageType === 'MajorStage' && item.name !== value.name
    ),
  ];
  const selectableMinorStages = [
    ...mapScopeList.filter(
      (item) => item.stageType === 'MinorStage' && item.name !== value.name
    ),
  ];

  function handleOpenModal(mode: 'majorStages' | 'minorStages') {
    setOpenSelection({
      majorStages: mode === 'majorStages',
      minorStages:
        selectableMinorStages.length > 0 ? mode === 'minorStages' : false,
    });
  }

  function handlePressListElement(name: string) {
    const selectedItem = mapScopeList.find((item) => item.name === name);
    setOpenSelection({ majorStages: false, minorStages: false });
    onChangeMapScope(selectedItem!);
  }

  function handlePressClear(type: 'MajorStage' | 'MinorStage') {
    if (type === 'MajorStage') {
      onChangeMapScope({
        id: journey.id,
        name: journey.name,
        stageType: 'Journey',
      });
    } else {
      const majorStage = stagesCtx.findMinorStagesMajorStage(value.id)!;
      onChangeMapScope({
        id: majorStage.id,
        name: majorStage?.title,
        stageType: 'MajorStage',
      });
    }
    setOpenSelection({ majorStages: false, minorStages: false });
  }

  function handlePressOutside() {
    setOpenSelection({ majorStages: false, minorStages: false });
  }

  return (
    <View style={styles.root}>
      <View style={styles.container}>
        <View style={styles.innerContainer}>
          <View style={styles.row}>
            <View style={styles.element}>
              <Text style={subtitle}>Journey</Text>
              <Pressable onPress={() => {}} style={styles.headerContainer}>
                <Text style={styles.header} numberOfLines={1}>
                  {selectedJourneyName!}
                </Text>
              </Pressable>
            </View>
            <View style={styles.element}>
              <Text style={subtitle}>Major Stage</Text>
              <Pressable
                onPress={() => handleOpenModal('majorStages')}
                style={[
                  styles.headerContainer,
                  openSelection.majorStages && styles.activeHeader,
                ]}
              >
                <Text style={styles.header} numberOfLines={1}>
                  {selectedMajorStageName!}
                </Text>
              </Pressable>
              {openSelection.majorStages && (
                <OutsidePressHandler onOutsidePress={handlePressOutside}>
                  <View style={styles.listContainer}>
                    <ScrollView style={styles.list}>
                      {selectableMajorStages.map((item: StageData) => (
                        <ListItem
                          key={generateRandomString()}
                          onPress={handlePressListElement.bind(item.name)}
                          textStyles={styles.listItemText}
                          containerStyles={styles.listItemContainer}
                        >
                          {item.name}
                        </ListItem>
                      ))}
                    </ScrollView>
                    <Button
                      colorScheme={ColorScheme.neutral}
                      mode={ButtonMode.flat}
                      onPress={() => handlePressClear('MajorStage')}
                      style={styles.button}
                      textStyle={styles.buttonText}
                    >
                      Clear
                    </Button>
                  </View>
                </OutsidePressHandler>
              )}
            </View>

            {(value.stageType === 'MinorStage' ||
              value.stageType === 'MajorStage') && (
              <View style={styles.element}>
                <Text style={subtitle}>Minor Stage</Text>
                <Pressable
                  onPress={() => handleOpenModal('minorStages')}
                  style={[
                    styles.headerContainer,
                    openSelection.minorStages && styles.activeHeader,
                  ]}
                >
                  <Text style={styles.header} numberOfLines={1}>
                    {selectedMinorStageName!}
                  </Text>
                </Pressable>
                {openSelection.minorStages &&
                  selectableMinorStages.length > 0 && (
                    <OutsidePressHandler onOutsidePress={handlePressOutside}>
                      <View style={styles.listContainer}>
                        <ScrollView style={styles.list}>
                          {selectableMinorStages.map((item: StageData) => (
                            <ListItem
                              key={generateRandomString()}
                              onPress={handlePressListElement.bind(item.name)}
                              textStyles={styles.listItemText}
                              containerStyles={styles.listItemContainer}
                            >
                              {item.name}
                            </ListItem>
                          ))}
                        </ScrollView>
                        <Button
                          colorScheme={ColorScheme.neutral}
                          mode={ButtonMode.flat}
                          onPress={() => handlePressClear('MinorStage')}
                          style={styles.button}
                          textStyle={styles.buttonText}
                        >
                          Clear
                        </Button>
                      </View>
                    </OutsidePressHandler>
                  )}
              </View>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'stretch',
    position: 'absolute',
  },
  container: {
    zIndex: 2,
    flexDirection: 'row',
  },
  innerContainer: {
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
  },
  element: {
    flexBasis: '32%',
    alignSelf: 'flex-start',
    marginHorizontal: 2,
  },
  headerContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 5,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
  },
  activeHeader: {
    borderBottomWidth: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  header: {
    textAlign: 'left',
    fontSize: 14,
  },
  errorText: {
    fontSize: 16,
    color: GlobalStyles.colors.error200,
    fontStyle: 'italic',
  },
  listContainer: {
    backgroundColor: 'white',
    borderColor: GlobalStyles.colors.grayDark,
    borderWidth: 1,
    borderTopWidth: 0,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    maxWidth: 150,
    maxHeight: 200,
  },
  list: {
    borderBottomWidth: 1,
  },
  listItemContainer: {
    marginTop: 0,
    padding: 0,
    borderWidth: 0,
    borderRadius: 0,
    backgroundColor: GlobalStyles.colors.graySoft,
    borderColor: GlobalStyles.colors.grayDark,
  },
  listItemText: {
    fontSize: 14,
    color: GlobalStyles.colors.grayDark,
  },
  button: {
    alignSelf: 'center',
    marginVertical: 0,
  },
  buttonText: {
    color: GlobalStyles.colors.grayDark,
  },
});

export default MapScopeSelector;
