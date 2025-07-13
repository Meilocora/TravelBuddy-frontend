import { LinearGradient } from 'expo-linear-gradient';
import { ReactElement } from 'react';

const SecondaryGradient: React.FC = (): ReactElement => {
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
      colors={['#b37d00', '#4c2b21', '#2e1915']}
      locations={[0.15, 0.85, 1]}
    />
  );
};

export default SecondaryGradient;
