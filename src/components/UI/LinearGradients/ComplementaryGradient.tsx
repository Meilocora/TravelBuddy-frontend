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
      colors={['#F3ECFAE6', '#EDE1F7CC', '#e7d0fae6']}
      locations={[0, 0.4, 1]}
    />
  );
};

export default ComplementaryGradient;
