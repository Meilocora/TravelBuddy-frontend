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
      colors={['#f8e8cdff', '#FFEED1', '#e9c896ff']}
      locations={[0.6, 0.8, 1]}
    />
  );
};

export default SecondaryGradient;
