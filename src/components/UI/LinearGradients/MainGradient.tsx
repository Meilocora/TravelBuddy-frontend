import { LinearGradient } from 'expo-linear-gradient';
import { ReactElement } from 'react';

const MainGradient: React.FC = (): ReactElement => {
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
      colors={['#008000', '#042f01', '#02461a']}
      locations={[0.15, 0.85, 1]}
    />
  );
};

export default MainGradient;
