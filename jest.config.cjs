module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testPathIgnorePatterns: ['/node_modules/', '/android/', '/ios/'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|react-native-reanimated|expo(nent)?|@expo(nent)?/.*|expo-modules-core|@expo/vector-icons|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|react-native-svg))',
  ],
};