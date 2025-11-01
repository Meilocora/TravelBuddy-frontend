import { ReactElement, useContext, useState } from 'react';
import { Pressable, StyleSheet, View, Text } from 'react-native';

import ElementTitle from '../UI/list/ElementTitle';
import { GlobalStyles } from '../../constants/styles';
import { Icons, Transportation, TransportationType } from '../../models';
import IconButton from '../UI/IconButton';
import { TransportElementInfopoint } from '../MinorStage/contentbox/TransportationElement';
import {
  formatAmount,
  formatCountdown,
  formatDateTimeString,
  formatDuration,
} from '../../utils';
import Link from '../UI/Link';
import { UserContext } from '../../store/user-context';

interface TransportationBoxProps {
  transportation: Transportation;
  majorStageIsOver: boolean;
  onPressEdit: () => void;
  customCountryId: number;
}

const TransportationBox: React.FC<TransportationBoxProps> = ({
  transportation,
  majorStageIsOver,
  onPressEdit,
  customCountryId,
}): ReactElement => {
  const userCtx = useContext(UserContext);
  const [openInfoBox, setOpenInfoBox] = useState(false);

  let countdown: string | undefined = undefined;
  if (transportation) {
    countdown = formatCountdown(
      transportation.start_time,
      transportation.start_time_offset,
      userCtx.timezoneoffset
    );
  }

  const handleOpenInfoBox = () => {
    setOpenInfoBox((prevState) => !prevState);
  };

  const duration = formatDuration(
    transportation.start_time,
    transportation.start_time_offset,
    transportation.arrival_time,
    transportation.arrival_time_offset
  );

  const infoPointsData = [
    {
      subtitle: 'Departure',
      data: `${formatDateTimeString(transportation.start_time)} at ${
        transportation.place_of_departure
      }`,
      location: {
        title: transportation.place_of_departure,
        lat: transportation.departure_latitude,
        lng: transportation.departure_longitude,
      },
    },
    {
      subtitle: 'Arrival',
      data: `${formatDateTimeString(transportation.arrival_time)} at ${
        transportation.place_of_arrival
      }`,
      location: {
        title: transportation.place_of_arrival,
        lat: transportation.arrival_latitude,
        lng: transportation.arrival_longitude,
      },
    },
    {
      subtitle: 'Details',
      data: `${duration} by ${transportation.type} (${formatAmount(
        transportation.transportation_costs
      )})`,
    },
  ];

  return (
    <View
      style={[
        styles.outerContainer,
        majorStageIsOver && styles.inactiveOuterContainer,
      ]}
    >
      <Pressable
        onPress={handleOpenInfoBox}
        android_ripple={{ color: GlobalStyles.colors.accent200 }}
        style={({ pressed }) => [
          styles.innerContainer,
          pressed && styles.pressed,
        ]}
      >
        <View style={styles.mainInfoContainer}>
          <View style={styles.textContainer}>
            <ElementTitle style={styles.title}>Transportation</ElementTitle>
            <Text style={styles.comment}>Starts in: {countdown}</Text>
          </View>
          <View style={styles.buttonContainer}>
            <IconButton
              icon={Icons.edit}
              color={GlobalStyles.colors.accent800}
              onPress={onPressEdit}
              style={styles.button}
            />
          </View>
        </View>
        {openInfoBox &&
          infoPointsData.map((infoPoint, index) => (
            <TransportElementInfopoint
              key={index}
              subtitle={infoPoint.subtitle}
              data={infoPoint.data}
              location={infoPoint.location}
              colorScheme='accent'
              transportationType={transportation.type as TransportationType}
              customCountryId={customCountryId}
            />
          ))}
        {transportation.link && (
          <Link link={transportation.link} style={styles.link} />
        )}
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  outerContainer: {
    width: '95%',
    marginVertical: 10,
    borderWidth: 1,
    borderColor: GlobalStyles.colors.accent700,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    overflow: 'hidden',
    backgroundColor: GlobalStyles.colors.accent100,
  },
  inactiveOuterContainer: {
    borderColor: GlobalStyles.colors.gray500,
    backgroundColor: GlobalStyles.colors.gray100,
  },
  innerContainer: {
    marginHorizontal: 10,
    marginVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainInfoContainer: {
    flexDirection: 'row',
  },
  textContainer: {
    width: '80%',
  },
  text: {
    textAlign: 'center',
  },
  comment: {
    textAlign: 'center',
    fontStyle: 'italic',
  },
  buttonContainer: {
    width: '20%',
  },
  pressed: {
    opacity: 0.5,
  },
  button: {
    width: 'auto',
  },
  link: {
    marginHorizontal: 'auto',
  },
});

export default TransportationBox;
