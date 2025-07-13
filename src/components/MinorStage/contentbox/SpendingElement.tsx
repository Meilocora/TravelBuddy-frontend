import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Pressable,
} from 'react-native';

import { ButtonMode, ColorScheme, MinorStage, Spending } from '../../../models';
import Button from '../../UI/Button';
import { GlobalStyles } from '../../../constants/styles';
import { formatAmount, generateRandomString } from '../../../utils';

interface SpendingListElementProps {
  spendings: Spending[];
  handleEdit: (id: number) => void;
}

const SpendingListElement: React.FC<SpendingListElementProps> = ({
  spendings,
  handleEdit,
}) => {
  return (
    <View style={listElementStyles.container}>
      <View style={[listElementStyles.row, listElementStyles.headRow]}>
        <View
          style={[listElementStyles.rowElement, { width: '40%' }]}
          key={generateRandomString()}
        >
          <Text style={listElementStyles.headerText}>Name</Text>
        </View>
        <View
          style={[listElementStyles.rowElement, { width: '35%' }]}
          key={generateRandomString()}
        >
          <Text style={listElementStyles.headerText}>Category</Text>
        </View>
        <View
          style={[listElementStyles.rowElement, { width: '25%' }]}
          key={generateRandomString()}
        >
          <Text style={listElementStyles.headerText}>Amount</Text>
        </View>
      </View>
      <ScrollView>
        {spendings.map((spending, index) => (
          <Pressable
            key={generateRandomString()}
            onPress={() => handleEdit(spending.id!)}
            style={[
              listElementStyles.row,
              index % 2 === 0
                ? listElementStyles.evenRow
                : listElementStyles.oddRow,
              index + 1 === spendings.length ? listElementStyles.lastRow : {},
            ]}
          >
            <View style={[listElementStyles.rowElement, { width: '40%' }]}>
              <Text
                ellipsizeMode='tail'
                numberOfLines={1}
                style={[
                  index % 2 === 0
                    ? listElementStyles.evenText
                    : listElementStyles.oddText,
                  { fontWeight: 'bold' },
                ]}
              >
                {spending.name}
              </Text>
            </View>
            <View style={[listElementStyles.rowElement, { width: '35%' }]}>
              <Text
                ellipsizeMode='tail'
                numberOfLines={1}
                style={
                  index % 2 === 0
                    ? listElementStyles.evenText
                    : listElementStyles.oddText
                }
              >
                {spending.category}
              </Text>
            </View>
            <View style={[listElementStyles.rowElement, { width: '25%' }]}>
              <Text
                ellipsizeMode='tail'
                numberOfLines={1}
                style={
                  index % 2 === 0
                    ? listElementStyles.evenText
                    : listElementStyles.oddText
                }
              >
                {formatAmount(spending.amount)}
              </Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
};

const listElementStyles = StyleSheet.create({
  container: {
    marginVertical: 5,
    maxHeight: 200,
    paddingBottom: 5,
    borderBottomColor: GlobalStyles.colors.complementary700,
    borderBottomWidth: 2,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  headRow: {
    backgroundColor: GlobalStyles.colors.gray500,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    marginBottom: 3,
  },
  oddRow: {
    marginBottom: 3,
    borderWidth: 1,
    borderColor: GlobalStyles.colors.complementary700,
    backgroundColor: GlobalStyles.colors.complementary700,
  },
  evenRow: {
    marginBottom: 3,
    borderWidth: 1,
    borderColor: GlobalStyles.colors.complementary700,
  },
  lastRow: {
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  rowElement: {
    // flexBasis: '33%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 16,
    fontWeight: 'bold',
    paddingVertical: 5,
    color: GlobalStyles.colors.gray200,
  },
  evenText: {
    fontSize: 14,
    paddingVertical: 5,
    color: GlobalStyles.colors.complementary700,
  },
  oddText: {
    fontSize: 14,
    paddingVertical: 5,
    color: GlobalStyles.colors.complementary100,
  },
});

interface SpendingElementProps {
  minorStage: MinorStage;
  handleAdd: () => void;
  handleEdit: (id: number) => void;
}

const SpendingElement: React.FC<SpendingElementProps> = ({
  minorStage,
  handleAdd,
  handleEdit,
}) => {
  const screenHeight = Dimensions.get('window').height;

  return (
    <View style={styles.container}>
      {minorStage.costs.spendings!.length === 0 ? (
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>No spendings found</Text>
        </View>
      ) : (
        <ScrollView style={{ maxHeight: screenHeight / 3 }}>
          <SpendingListElement
            spendings={minorStage.costs.spendings!}
            handleEdit={handleEdit}
            key={generateRandomString()}
          />
        </ScrollView>
      )}
      <View style={styles.buttonContainer}>
        <Button
          onPress={handleAdd}
          colorScheme={ColorScheme.complementary}
          mode={ButtonMode.flat}
        >
          Add Spending
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  infoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SpendingElement;
