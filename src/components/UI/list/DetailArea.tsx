import { ReactElement } from 'react';
import { StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { View } from 'react-native';

import ElementDetail from './ElementDetail';
import { generateRandomString } from '../../../utils/generator';
import { Icons } from '../../../models';

export interface ElementDetailInfo {
  title?: string;
  icon?: Icons;
  value: string;
  textStyle?: TextStyle;
  link?: string;
  onPress?: () => void;
}

interface DetailProps {
  areaStyle?: ViewStyle;
  detailStyle?: ViewStyle;
  elementDetailInfo: ElementDetailInfo[];
}

const DetailArea: React.FC<DetailProps> = ({
  areaStyle,
  detailStyle,
  elementDetailInfo,
}): ReactElement => {
  return (
    <View style={[styles.detailsContainer, areaStyle]}>
      {elementDetailInfo.map((info, index) => (
        <ElementDetail
          key={generateRandomString()}
          title={info.title}
          icon={info.icon}
          value={info.value}
          style={detailStyle}
          textStyle={info.textStyle}
          link={info.link}
          onPress={info.onPress}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  detailsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 6,
    width: '95%',
  },
});

export default DetailArea;
