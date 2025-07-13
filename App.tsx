import React from 'react';
import {
  BottomTabNavigationProp,
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import {
  createNativeStackNavigator,
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { EventProvider } from 'react-native-outside-press';
import * as NavigationBar from 'expo-navigation-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useContext, useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import MainGradient from './src/components/UI/LinearGradients/MainGradient';
import AllJourneys from './src/screens/BottomTabsNavigator/AllJourneys';
import UserProfile from './src/screens/UserProfile';
import { GlobalStyles } from './src/constants/styles';
import IconButton from './src/components/UI/IconButton';
import {
  BottomTabsParamList,
  Icons,
  JourneyBottomTabsParamsList,
  StackParamList,
  ManageJourneyRouteProp,
  AuthStackParamList,
  MajorStageStackParamList,
} from './src/models';
import ManageJourney from './src/screens/BottomTabsNavigator/ManageJourney';
import Locations from './src/screens/BottomTabsNavigator/Locations';
import Planning from './src/screens/JourneyBottomTabsNavigator/Planning';
import Overview from './src/screens/JourneyBottomTabsNavigator/Overview';
import Map from './src/screens/JourneyBottomTabsNavigator/Map';
import AuthContextProvider, { AuthContext } from './src/store/auth-context';
import AuthScreen from './src/screens/Auth/AuthScreen';
import CustomCountryContextProvider from './src/store/custom-country-context';
import ManageCustomCountry from './src/screens/ManageCustomCountry';
import ManagePlaceToVisit from './src/screens/ManagePlaceToVisit';
import PlaceContextProvider from './src/store/place-context';
import ManageMajorStage from './src/screens/JourneyBottomTabsNavigator/MajorStageStackNavigator/ManageMajorStage';
import SecondaryGradient from './src/components/UI/LinearGradients/SecondaryGradient';
import ManageTransportation from './src/screens/JourneyBottomTabsNavigator/MajorStageStackNavigator/ManageTransportation';
import ManageMinorStage from './src/screens/JourneyBottomTabsNavigator/MajorStageStackNavigator/ManageMinorStage';
import MinorStages from './src/screens/JourneyBottomTabsNavigator/MajorStageStackNavigator/MinorStages';
import ManageActivity from './src/screens/JourneyBottomTabsNavigator/MajorStageStackNavigator/ManageActivity';
import ManageSpending from './src/screens/JourneyBottomTabsNavigator/MajorStageStackNavigator/ManageSpending';
import LocationPickMap from './src/screens/LocationPickMap';
import ShowMap from './src/screens/ShowMap';
import StagesContextProvider from './src/store/stages-context';
import UserContextProvider from './src/store/user-context';

// TODO: Add Animations
// TODO: Fix custom progress bar
// TODO: Add Chatbot, thats translates into local language

const Stack = createNativeStackNavigator<StackParamList>();
const Auth = createNativeStackNavigator<AuthStackParamList>();
const BottomTabs = createBottomTabNavigator<BottomTabsParamList>();
const JourneyBottomTabs =
  createBottomTabNavigator<JourneyBottomTabsParamsList>();
const MajorStageStack = createNativeStackNavigator<MajorStageStackParamList>();

const navTheme = DefaultTheme;
navTheme.colors.background = 'transparent';

const AuthStack = () => {
  return (
    <>
      <MainGradient />
      <Auth.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Auth.Screen name='AuthScreen' component={AuthScreen} />
      </Auth.Navigator>
    </>
  );
};

const BottomTabsNavigator = () => {
  return (
    <>
      <MainGradient />
      <BottomTabs.Navigator
        screenOptions={({
          navigation,
        }: {
          navigation: BottomTabNavigationProp<BottomTabsParamList>;
        }) => ({
          headerTintColor: 'white',
          headerStyle: { backgroundColor: GlobalStyles.colors.primary500 },
          headerTitleAlign: 'center',
          tabBarStyle: {
            backgroundColor: GlobalStyles.colors.primary500,
            borderTopWidth: 1,
            borderTopColor: GlobalStyles.colors.accent600,
            height: 60,
            paddingTop: 5,
            paddingBottom: 5,
          },
          tabBarActiveTintColor: GlobalStyles.colors.accent600,
          tabBarIconStyle: { color: 'white' },
          tabBarLabelStyle: {
            fontSize: 14,
          },
          headerRight: ({ tintColor }) => (
            <IconButton
              color={tintColor}
              size={24}
              icon={Icons.person}
              onPress={() => {
                navigation.navigate('UserProfile');
              }}
            />
          ),
        })}
      >
        <BottomTabs.Screen
          name='AllJourneys'
          component={AllJourneys}
          options={{
            title: 'All Journeys',
            tabBarLabel: 'Journeys',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name={Icons.listCircle} size={size} color={color} />
            ),
          }}
        />
        <BottomTabs.Screen
          name='ManageJourney'
          component={ManageJourney}
          options={({ route }: { route: ManageJourneyRouteProp }) => ({
            title: !!route.params?.journeyId ? 'Edit Journey' : 'Add Journey',
            tabBarLabel: !!route.params?.journeyId ? 'Edit' : 'Add',
            tabBarIcon: ({ color, size }) => (
              <Ionicons
                name={!!route.params?.journeyId ? Icons.edit : Icons.add}
                size={size}
                color={color}
              />
            ),
            unmountOnBlur: true,
            presentation: 'modal',
            animation: 'fade',
          })}
        />
        <BottomTabs.Screen
          name='Locations'
          component={Locations}
          options={{
            tabBarLabel: 'Locations',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name={Icons.pin} size={size} color={color} />
            ),
          }}
        />
      </BottomTabs.Navigator>
    </>
  );
};

const JourneyBottomTabsNavigator = () => {
  return (
    <>
      <SecondaryGradient />
      <JourneyBottomTabs.Navigator
        screenOptions={({
          navigation,
        }: {
          navigation: NativeStackNavigationProp<BottomTabsParamList>;
        }) => ({
          headerTintColor: 'white',
          headerStyle: { backgroundColor: GlobalStyles.colors.accent700 },
          headerTitleAlign: 'center',
          headerLeft: ({ tintColor }) => (
            <IconButton
              color={tintColor}
              size={24}
              icon={Icons.arrowBack}
              onPress={() => {
                navigation.navigate('AllJourneys');
              }}
            />
          ),
          tabBarStyle: {
            backgroundColor: GlobalStyles.colors.accent700,
            borderTopWidth: 1,
            borderTopColor: 'white',
            height: 60,
            paddingTop: 5,
            paddingBottom: 5,
          },
          tabBarInactiveTintColor: GlobalStyles.colors.gray200,
          tabBarActiveTintColor: 'white',
          tabBarIconStyle: { color: 'white' },
          tabBarLabelStyle: {
            fontSize: 14,
          },
        })}
      >
        <JourneyBottomTabs.Screen
          name='Overview'
          component={Overview}
          options={{
            tabBarLabel: 'Overview',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name={Icons.readerOutline} size={size} color={color} />
            ),
          }}
        />
        <JourneyBottomTabs.Screen
          name='Planning'
          component={Planning}
          options={{
            tabBarLabel: 'Planning',
            tabBarIcon: ({ color, size }) => (
              <Ionicons
                name={Icons.calendarOutline}
                size={size}
                color={color}
              />
            ),
          }}
        />
        <JourneyBottomTabs.Screen
          name='Map'
          component={Map}
          options={{
            tabBarLabel: 'Map',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name={Icons.compassOutline} size={size} color={color} />
            ),
          }}
        />
        <JourneyBottomTabs.Screen
          name='MajorStageStackNavigator'
          component={MajorStageStackNavigator}
          options={{
            tabBarButton: () => null,
            headerShown: false,
          }}
        />
      </JourneyBottomTabs.Navigator>
    </>
  );
};

const MajorStageStackNavigator = () => {
  return (
    <MajorStageStack.Navigator
      screenOptions={() => ({
        headerTintColor: 'white',
        headerStyle: { backgroundColor: GlobalStyles.colors.accent700 },
        headerTitleAlign: 'center',
        headerShadowVisible: false,
        animationEnabled: false,
        headerBackVisible: false,
      })}
    >
      <MajorStageStack.Screen
        name='ManageMajorStage'
        component={ManageMajorStage}
      />
      <MajorStageStack.Screen
        name='ManageMinorStage'
        component={ManageMinorStage}
      />
      <MajorStageStack.Screen
        name='ManageTransportation'
        component={ManageTransportation}
      />
      <MajorStageStack.Screen name='MinorStages' component={MinorStages} />
      <MajorStageStack.Screen
        name='ManageActivity'
        component={ManageActivity}
      />
      <MajorStageStack.Screen
        name='ManageSpending'
        component={ManageSpending}
      />
    </MajorStageStack.Navigator>
  );
};

// All Screens, that require Authentication, are wrapped in AuthenticatedStack
const AuthenticatedStack = () => {
  const authCtx = useContext(AuthContext);

  return (
    <UserContextProvider>
      <StagesContextProvider>
        <CustomCountryContextProvider>
          <PlaceContextProvider>
            <Stack.Navigator
              screenOptions={() => ({
                headerTintColor: 'white',
                headerStyle: {
                  backgroundColor: GlobalStyles.colors.primary500,
                },
                headerTitleAlign: 'center',
                headerShadowVisible: false,
                animationEnabled: false,
              })}
            >
              <Stack.Screen
                name='BottomTabsNavigator'
                component={BottomTabsNavigator}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name='UserProfile'
                component={UserProfile}
                options={{
                  headerRight: ({ tintColor }) => (
                    <IconButton
                      color={tintColor}
                      size={24}
                      icon={Icons.logout}
                      onPress={() => {
                        authCtx.logout();
                      }}
                    />
                  ),
                }}
              />
              <Stack.Screen
                name='JourneyBottomTabsNavigator'
                component={JourneyBottomTabsNavigator}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name='ManageCustomCountry'
                component={ManageCustomCountry}
              />
              <Stack.Screen
                name='ManagePlaceToVisit'
                component={ManagePlaceToVisit}
              />
              <Stack.Screen
                name='LocationPickMap'
                component={LocationPickMap}
              />
              <Stack.Screen name='ShowMap' component={ShowMap} />
            </Stack.Navigator>
          </PlaceContextProvider>
        </CustomCountryContextProvider>
      </StagesContextProvider>
    </UserContextProvider>
  );
};

const Navigation = () => {
  const authCtx = useContext(AuthContext);
  return (
    <GestureHandlerRootView>
      <NavigationContainer theme={navTheme}>
        {!authCtx.isAuthenticated && <AuthStack />}
        {authCtx.isAuthenticated && <AuthenticatedStack />}
      </NavigationContainer>
    </GestureHandlerRootView>
  );
};

const Root = () => {
  const authCtx = useContext(AuthContext);

  // Logic for auto login
  useEffect(() => {
    async function fetchToken() {
      const storedToken = await AsyncStorage.getItem('token');
      const storedRefreshToken = await AsyncStorage.getItem('refreshToken');

      if (storedToken) {
        authCtx.authenticate(storedToken, storedRefreshToken || '');
      }
    }

    fetchToken();
  }, [authCtx]);

  return <Navigation />;
};

export default function App() {
  // Hide Android NavigationBar
  useEffect(() => {
    NavigationBar.setVisibilityAsync('hidden');
  }, []);

  return (
    <EventProvider>
      <StatusBar style='inverted' />
      <AuthContextProvider>
        <Root />
      </AuthContextProvider>
    </EventProvider>
  );
}
