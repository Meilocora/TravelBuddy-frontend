module.exports = ({ config }) => {
  // Erkennungsmechanismus: setze APP_VARIANT=dev für Dev-Builds
  const variant =
    process.env.APP_VARIANT || process.env.EAS_BUILD_PROFILE || 'production';
  const isDev = variant === 'dev' || variant === 'development';

  const name = isDev ? 'TravelBuddy (Dev)' : config.name || 'TravelBuddy';
  const slug = isDev ? 'travelbuddy-dev' : config.slug || 'travelbuddy';

  // Originale Application identifier: com.meilocora.travelbuddy
  const androidPackage = isDev
    ? 'com.meilocora.travelbuddy.dev'
    : config.android?.package || 'com.meilocora.travelbuddy';
  const iosBundle = isDev
    ? 'com.meilocora.travelbuddy.dev'
    : config.ios?.bundleIdentifier || 'com.meilocora.travelbuddy';

  const googleApiKey = process.env.REACT_APP_GOOGLE_API_KEY;
  const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY || googleApiKey;

  if (!googleMapsApiKey) {
    console.warn(
      '[app.config] GOOGLE_MAPS_API_KEY / REACT_APP_GOOGLE_API_KEY nicht gesetzt - Karten werden nicht geladen.',
    );
  }

  return {
    ...config,
    name,
    slug,
    android: {
      ...(config.android || {}),
      package: androidPackage,
      config: {
        ...(config.android?.config || {}),
        googleMaps: { apiKey: googleMapsApiKey },
      },
    },
    ios: {
      ...(config.ios || {}),
      bundleIdentifier: iosBundle,
      config: {
        ...(config.ios?.config || {}),
        googleMapsApiKey,
      },
    },
    extra: {
      ...(config.extra || {}),
      // Backend-URL aus der Environment einbinden
      backendUrl:
        process.env.REACT_APP_BACKEND_URL ||
        process.env.BACKEND_URL ||
        config.extra?.backendUrl,
      googleApiKey,
    },
    plugins: [...(config.plugins || []), 'expo-asset'],
  };
};
