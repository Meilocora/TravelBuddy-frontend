import { LinearGradient } from 'expo-linear-gradient';
import { ReactElement } from 'react';

const ComplementaryGradient: React.FC = (): ReactElement => {
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
      colors={['#71098e', '#420560', '#2d0245']}
      locations={[0.15, 0.85, 1]}
    />
  );
};

export default ComplementaryGradient;
