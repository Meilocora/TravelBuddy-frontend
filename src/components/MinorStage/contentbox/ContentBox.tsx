import { ReactElement, useContext } from 'react';
import { View, StyleSheet } from 'react-native';

import { MinorStage } from '../../../models';
import ContentHeader from './ContentHeader';
import { GlobalStyles } from '../../../constants/styles';
import MainContent from './MainContent';
import { generateRandomString } from '../../../utils/generator';
import { validateIsOver } from '../../../utils';
import { StagesContext } from '../../../store/stages-context';

interface ContenBoxProps {
  minorStage: MinorStage;
  majorStageId: number;
  journeyId: number;
}

const ContentBox: React.FC<ContenBoxProps> = ({
  journeyId,
  majorStageId,
  minorStage,
}): ReactElement => {
  const stagesCtx = useContext(StagesContext);
  const isOver = validateIsOver(minorStage.scheduled_end_time);

  const handleOnPressHeader = (header: string) => {
    stagesCtx.setActiveHeaderHandler(minorStage.id, header.toLowerCase());
  };

  let contentHeaders = ['Transport', 'Places', 'Activities', 'Spendings'];

  return (
    <>
      <View
        style={[
          styles.contentHeaderContainer,
          isOver && styles.inactiveContentHeaderContainer,
        ]}
      >
        {contentHeaders.map((header) => {
          return (
            <ContentHeader
              onPress={handleOnPressHeader}
              title={header}
              key={generateRandomString()}
              headerStyle={
                stagesCtx.activeHeader.minorStageId === minorStage.id &&
                stagesCtx.activeHeader.header === header.toLowerCase()
                  ? styles.activeHeader
                  : {}
              }
            />
          );
        })}
      </View>
      <MainContent
        journeyId={journeyId}
        majorStageId={majorStageId}
        minorStage={minorStage}
      />
    </>
  );
};

const styles = StyleSheet.create({
  contentHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 5,
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 2,
    borderBottomColor: GlobalStyles.colors.purpleAccent,
  },
  inactiveContentHeaderContainer: {
    borderBottomColor: GlobalStyles.colors.grayMedium,
  },
  activeHeader: {
    color: GlobalStyles.colors.purpleAccent,
    fontWeight: 'bold',
    fontSize: 18,
  },
  activeContainer: {
    backgroundColor: GlobalStyles.colors.amberAccent,
  },
});

export default ContentBox;
