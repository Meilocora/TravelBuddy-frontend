import { View, Text, StyleSheet, Dimensions, Pressable } from 'react-native';

import { ButtonMode, ColorScheme, MinorStage, Spending } from '../../../models';
import Button from '../../UI/Button';
import { GlobalStyles } from '../../../constants/styles';
import { formatAmount } from '../../../utils';

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
        <View style={[listElementStyles.rowElement, { width: '40%' }]}>
          <Text style={listElementStyles.headerText}>Name</Text>
        </View>
        <View style={[listElementStyles.rowElement, { width: '35%' }]}>
          <Text style={listElementStyles.headerText}>Category</Text>
        </View>
        <View style={[listElementStyles.rowElement, { width: '25%' }]}>
          <Text style={listElementStyles.headerText}>Amount</Text>
        </View>
      </View>
      <View>
        {spendings.map((spending, index) => (
          <Pressable
            key={spending.id!.toString()}
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
                numberOfLines={2}
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
      </View>
    </View>
  );
};

const listElementStyles = StyleSheet.create({
  container: {
    marginVertical: 5,
    paddingBottom: 5,
    borderBottomColor: GlobalStyles.colors.purpleDark,
    borderBottomWidth: 2,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  headRow: {
    backgroundColor: GlobalStyles.colors.grayDark,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    marginBottom: 3,
  },
  oddRow: {
    marginBottom: 3,
    borderWidth: 1,
    borderColor: GlobalStyles.colors.purpleDark,
    backgroundColor: GlobalStyles.colors.purpleDark,
  },
  evenRow: {
    marginBottom: 3,
    borderWidth: 1,
    borderColor: GlobalStyles.colors.purpleDark,
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
    color: GlobalStyles.colors.graySoft,
  },
  evenText: {
    fontSize: 14,
    paddingVertical: 5,
    color: GlobalStyles.colors.purpleDark,
  },
  oddText: {
    fontSize: 14,
    paddingVertical: 5,
    color: GlobalStyles.colors.purpleSoft,
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
          <Text style={styles.infoText}>No spendings found...</Text>
        </View>
      ) : (
        <View>
          <SpendingListElement
            spendings={minorStage.costs.spendings!}
            handleEdit={handleEdit}
          />
        </View>
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
