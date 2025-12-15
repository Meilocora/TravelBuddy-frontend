import React, { ReactElement, useContext, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { GlobalStyles } from '../../../constants/styles';
import { Icons, MinorStage } from '../../../models';
import Input from '../../UI/form/Input';
import MinorStageSelectorList from './MinorStageSelectorList';
import { StagesContext } from '../../../store/stages-context';
import IconButton from '../../UI/IconButton';

interface MinorStageSelectorProps {
  onChangeMinorStage: (minorStageId: number | undefined) => void;
  invalid: boolean;
  defaultValue: number | undefined;
  errors: string[];
}

const MinorStageSelector: React.FC<MinorStageSelectorProps> = ({
  onChangeMinorStage,
  invalid,
  defaultValue,
  errors,
}): ReactElement => {
  const [openSelection, setOpenSelection] = useState(false);
  const stagesCtx = useContext(StagesContext);

  let minorStage: MinorStage | undefined;
  if (defaultValue) {
    minorStage = stagesCtx.findMinorStage(defaultValue);
  }

  function handleOpenModal() {
    setOpenSelection(true);
  }

  return (
    <>
      <MinorStageSelectorList
        visible={openSelection}
        defaultValue={minorStage || ''}
        onCancel={() => setOpenSelection(false)}
        onChangeMinorStage={onChangeMinorStage}
      />

      <View style={styles.container}>
        <View>
          <Pressable onPress={handleOpenModal}>
            <Input
              maxLength={12}
              label='Minor Stage'
              errors={errors}
              textInputConfig={{
                value: minorStage?.title,
                readOnly: true,
                textAlign: 'left',
              }}
            />
          </Pressable>
          {defaultValue && (
            <IconButton
              icon={Icons.delete}
              onPress={() => onChangeMinorStage(undefined)}
              style={styles.deleteButton}
              color={GlobalStyles.colors.graySoft}
            />
          )}
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  outside: {
    flex: 1,
    height: '100%',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  deleteButton: {
    position: 'absolute',
    right: -4,
    bottom: 10,
  },
});

export default MinorStageSelector;
