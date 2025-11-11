import { LinearGradient } from 'expo-linear-gradient';
import { ReactElement } from 'react';

const AuthGradient: React.FC = (): ReactElement => {
  return (
    <LinearGradient
      style={{
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
      colors={['#F1FAF3', '#bcf5d2ff', '#96f0afff', '#4aa062ff']}
      locations={[0, 0.6, 0.85, 1]}
    />
  );
};

export default AuthGradient;
