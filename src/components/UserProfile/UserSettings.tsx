import { ReactElement, useContext } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { GlobalStyles } from '../../constants/styles';
import IconButton from '../UI/IconButton';
import { Icons } from '../../models';
import { UserContext } from '../../store/user-context';

interface UserSettingsProps {}

const UserSettings: React.FC<UserSettingsProps> = ({}): ReactElement => {
  const userCtx = useContext(UserContext);
  return (
    <View style={styles.container}>
      <View>
        <View style={styles.innerContainer}>
          <View style={styles.row}>
            <View style={styles.rowElement}>
              <Text style={styles.subtitle}>Current Location</Text>
            </View>
            <View style={styles.rowElement}>
              <Text style={styles.text}>
                Lat: {userCtx.currentLocation?.latitude}
              </Text>
              <Text style={styles.text}>
                Lng: {userCtx.currentLocation?.longitude}
              </Text>
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.rowElement}>
              <Text style={styles.subtitle}>UTC Offset</Text>
            </View>
            <View style={styles.rowElement}>
              <Text style={styles.text}>{userCtx.timezoneoffset} h</Text>
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.rowElement}>
              <Text style={styles.subtitle}>Local Currency</Text>
            </View>
            <View style={styles.rowElement}>
              <Text style={styles.text}>
                {userCtx.localCurrency.currency}{' '}
                {userCtx.localCurrency.currency !== 'EUR' &&
                  `~ ${(1 / userCtx.localCurrency.conversionRate).toFixed(2)}€`}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginHorizontal: 'auto',
    zIndex: 1,
  },
  innerContainer: {
    backgroundColor: GlobalStyles.colors.gray500,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginHorizontal: 'auto',
    borderWidth: 0.75,
    borderRadius: 10,
    width: '80%',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-around',
    borderColor: GlobalStyles.colors.gray100,
  },
  rowElement: {
    width: '45%',
    flexDirection: 'column',
    marginVertical: 5,
    justifyContent: 'center',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: GlobalStyles.colors.gray100,
  },
  text: {
    color: GlobalStyles.colors.gray50,
  },
  icon: {
    marginVertical: 0,
    paddingVertical: 0,
  },
});

export default UserSettings;
