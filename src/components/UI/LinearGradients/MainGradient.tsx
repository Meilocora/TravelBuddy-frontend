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
      colors={['#F1FAF3', '#d3f3dfff', '#b5f1c6']}
      locations={[0, 0.4, 1]}
    />
  );
};

export default MainGradient;
