import React, {
  ReactElement,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { StyleSheet } from 'react-native';

import { StackParamList, UserProfileRouteProp } from '../models';
import MainGradient from '../components/UI/LinearGradients/MainGradient';
import CurrentElementList from '../components/CurrentElements/CurrentElementList';
import { ScrollView } from 'react-native-gesture-handler';
import { StagesContext } from '../store/stages-context';
import UserSettings from '../components/UserProfile/UserSettings';
import UserStats from '../components/UserProfile/UserStats';
import UserProfileChart from '../components/UserProfile/UserProfileChart';
import UserDataForm from '../components/UserProfile/UserDataForm';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import HeaderTitle from '../components/UI/HeaderTitle';
import { AuthContext } from '../store/auth-context';
import Popup from '../components/UI/Popup';
import { GlobalStyles } from '../constants/styles';

interface UserProfileProps {
  route: UserProfileRouteProp;
  navigation: NativeStackNavigationProp<StackParamList, 'UserProfile'>;
}

const UserProfile: React.FC<UserProfileProps> = ({
  route,
  navigation,
}): ReactElement => {
  const [popupText, setPopupText] = useState<string | null>();
  const [showDetails, setShowDetails] = useState(true);

  const scrollViewRef = useRef<ScrollView>(null);

  const stagesCtx = useContext(StagesContext);
  const authCtx = useContext(AuthContext);
  const journeys = stagesCtx.journeys;

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <HeaderTitle title={`${authCtx.username}'s Profile`} />
      ),
      headerTintColor: GlobalStyles.colors.grayDark,
    });
  }, [authCtx.username]);

  function scrollToTop() {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  }

  return (
    <ScrollView
      ref={scrollViewRef}
      style={styles.root}
      contentContainerStyle={{ flexGrow: 1 }}
      nestedScrollEnabled
    >
      {popupText && (
        <Popup content={popupText} onClose={() => setPopupText(null)} />
      )}
      <MainGradient />
      <CurrentElementList />
      <UserSettings />
      <UserDataForm setPopupText={setPopupText} scrollToTop={scrollToTop} />
      <UserStats
        journeys={journeys}
        toggleVisivility={() => setShowDetails((prevValue) => !prevValue)}
        isVisible={showDetails}
      />
      <UserProfileChart journeys={journeys} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

export default UserProfile;
