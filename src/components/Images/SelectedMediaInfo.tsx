import { ReactElement } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';

import { Medium } from '../../models/media';
import Button from '../UI/Button';
import { ButtonMode, ColorScheme, Icons } from '../../models';
import { GlobalStyles } from '../../constants/styles';
import IconButton from '../UI/IconButton';

interface SelectedMediaInfoProps {
  selectedMedia: Medium[] | undefined;
  onCancel: () => void;
  allMediaSelected?: boolean;
  selectAllMedia: () => void;
}

const SelectedMediaInfo: React.FC<SelectedMediaInfoProps> = ({
  selectedMedia,
  onCancel,
  allMediaSelected,
  selectAllMedia,
}): ReactElement => {
  return (
    <>
      {selectedMedia && selectedMedia.length > 0 ? (
        <View style={styles.container}>
          <Pressable onPress={selectAllMedia} style={styles.allContainer}>
            <IconButton
              icon={allMediaSelected ? Icons.checkmarkOutline : Icons.circle}
              onPress={selectAllMedia}
              style={styles.circle}
              color={GlobalStyles.colors.graySoft}
              size={30}
            />
            <Text style={styles.allText}>All</Text>
          </Pressable>
          <Text style={styles.text}>{selectedMedia.length} selected</Text>
          <Button
            colorScheme={ColorScheme.neutral}
            onPress={onCancel}
            mode={ButtonMode.flat}
            textStyle={styles.button}
          >
            Cancel
          </Button>
        </View>
      ) : (
        <View></View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 0,
    flexDirection: 'row',
    paddingHorizontal: 15,
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: GlobalStyles.colors.grayMedium,
    borderBottomWidth: 2,
    borderColor: GlobalStyles.colors.grayDark,
  },
  text: {
    fontSize: 20,
    color: GlobalStyles.colors.graySoft,
  },
  button: {
    fontSize: 20,
    color: GlobalStyles.colors.graySoft,
  },
  allContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  circle: {
    marginVertical: 4,
    top: -6,
    padding: 0,
  },
  allText: {
    position: 'absolute',
    top: 33,
    color: GlobalStyles.colors.graySoft,
  },
});

export default SelectedMediaInfo;
