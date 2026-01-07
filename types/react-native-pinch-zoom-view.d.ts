declare module 'react-native-pinch-zoom-view' {
  import * as React from 'react';
  import { ViewProps } from 'react-native';

  export interface PinchZoomViewProps extends ViewProps {
    scalable?: boolean;
    minScale?: number;
    maxScale?: number;
    children?: React.ReactNode;
  }

  const PinchZoomView: React.ComponentType<PinchZoomViewProps>;
  export default PinchZoomView;
}
