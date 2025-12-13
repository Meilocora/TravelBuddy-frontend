import { ReactElement } from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { formatRouteDuration } from '../../utils';
import { Icons } from '../../models';
import { GlobalStyles } from '../../constants/styles';
import IconButton from '../UI/IconButton';

export interface RouteInfoType {
  distance?: number;
  duration?: number;
  display: boolean;
}

interface RouteInfoProps {
  routeInfo: RouteInfoType;
  onClose: () => void;
  onDeleteRoute: () => void;
  topDistance?: number;
}

const RouteInfo: React.FC<RouteInfoProps> = ({
  routeInfo,
  onClose,
  onDeleteRoute,
  topDistance,
}): ReactElement => {
  let containerStyle = { top: 10 };
  if (topDistance) {
    containerStyle = { top: topDistance };
  }

  return (
    <>
      {routeInfo.distance && routeInfo.duration ? (
        <View style={[styles.routeInfoContainer, containerStyle]}>
          <Pressable onPress={onClose} style={styles.routeInfoTextContainer}>
            <Text style={styles.routeInfoText}>
              Distance: {routeInfo.distance.toFixed(1)} km | Time:{' '}
              {formatRouteDuration(routeInfo.duration)}
            </Text>
          </Pressable>
          <IconButton
            icon={Icons.delete}
            onPress={onDeleteRoute}
            color={GlobalStyles.colors.graySoft}
            containerStyle={styles.deleteIcon}
          />
        </View>
      ) : (
        <View style={[styles.routeInfoContainer, containerStyle]}>
          <Pressable
            onPress={onDeleteRoute}
            style={styles.routeInfoTextContainer}
          >
            <Text style={styles.routeInfoText}>No route found...</Text>
          </Pressable>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  routeInfoContainer: {
    position: 'absolute',
    alignSelf: 'center',
  },
  routeInfoTextContainer: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 8,
    borderRadius: 8,
    zIndex: 1,
  },
  routeInfoText: {
    color: 'white',
    fontWeight: 'bold',
  },
  deleteIcon: {
    marginHorizontal: 'auto',
    backgroundColor: GlobalStyles.colors.grayDark,
    borderRadius: 50,
  },
});

export default RouteInfo;
