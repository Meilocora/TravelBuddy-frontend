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

  return {
    ...config,
    name,
    slug,
    android: {
      ...(config.android || {}),
      package: androidPackage,
    },
    ios: {
      ...(config.ios || {}),
      bundleIdentifier: iosBundle,
    },
    extra: {
      ...(config.extra || {}),
      // Backend-URL aus der Environment einbinden
      backendUrl:
        process.env.REACT_APP_BACKEND_URL ||
        process.env.BACKEND_URL ||
        config.extra?.backendUrl,
      // optional: Google API key
      googleApiKey:
        process.env.REACT_APP_GOOGLE_API_KEY || config.extra?.googleApiKey,
    },
  };
};
