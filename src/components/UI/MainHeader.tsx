import React, { ReactElement } from 'react';
import {
  StyleProp,
  StyleSheet,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import Svg, {
  Defs,
  LinearGradient as SvgGradient,
  Stop,
  Text as SvgText,
} from 'react-native-svg';
import { GlobalStyles } from '../../constants/styles';

type GradientTextProps = {
  children: string;
  colors: string[];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  style?: StyleProp<TextStyle>;
};

const GradientText: React.FC<GradientTextProps> = ({
  children,
  colors,
  start = { x: 0, y: 0 },
  end = { x: 1, y: 1 },
  style,
}) => {
  const flattenedStyle = StyleSheet.flatten(style) as TextStyle | undefined;
  const fontSize = Math.max(
    1,
    Math.floor((flattenedStyle?.fontSize as number) || 32)
  );
  const fontWeight = (flattenedStyle?.fontWeight as any) || '800';
  const letterSpacing = (flattenedStyle?.letterSpacing as number) ?? 0;
  const lineHeight = Math.ceil(
    (flattenedStyle?.lineHeight as number) || fontSize * 1.2
  );

  const x1 = `${(start.x ?? 0) * 100}%`;
  const y1 = `${(start.y ?? 0) * 100}%`;
  const x2 = `${(end.x ?? 1) * 100}%`;
  const y2 = `${(end.y ?? 1) * 100}%`;

  return (
    <View style={{ width: '100%', alignItems: 'center' }}>
      <Svg
        height={lineHeight}
        width='100%'
        viewBox={`0 0 100 ${lineHeight}`}
        preserveAspectRatio='xMidYMid meet'
      >
        <Defs>
          <SvgGradient id='textGradient' x1={x1} y1={y1} x2={x2} y2={y2}>
            {colors.map((c, i) => (
              <Stop
                key={i}
                offset={`${(i / (colors.length - 1)) * 100}%`}
                stopColor={c}
              />
            ))}
          </SvgGradient>
        </Defs>
        <SvgText
          fill='url(#textGradient)'
          fontSize={fontSize}
          fontWeight={fontWeight}
          letterSpacing={letterSpacing}
          x='50'
          y={fontSize}
          textAnchor='middle'
        >
          {children}
        </SvgText>
      </Svg>
    </View>
  );
};

interface MainHeaderProps {
  title: string;
  containerStyle?: ViewStyle;
  titleStyle?: TextStyle;
  gradientColors?: string[];
  gradientStart?: { x: number; y: number };
  gradientEnd?: { x: number; y: number };
}

/**
 * MainHeader with gradient green title using react-native-svg (Expo friendly).
 */
const MainHeader: React.FC<MainHeaderProps> = ({
  title,
  containerStyle,
  titleStyle,
  gradientColors = ['#008000', '#70E000', '#FFFBE6'],
  gradientStart = { x: 0, y: 0.1 },
  gradientEnd = { x: 0, y: 1.5 },
}): ReactElement => {
  return (
    <View style={[styles.container, containerStyle]}>
      <GradientText
        colors={gradientColors}
        start={gradientStart}
        end={gradientEnd}
        style={[styles.titleBase, styles.titleOverrides, titleStyle]}
      >
        {title}
      </GradientText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: '25%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleBase: {
    fontSize: 54,
    fontWeight: '800',
    letterSpacing: 3.5,
  },
  titleOverrides: {
    // Shadow for bright backgrounds (applies to non-SVG text only; kept for style parity)
    textShadowColor: 'rgba(0,0,0,0.08)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    color: GlobalStyles?.colors?.grayMedium ?? '#E7E7E7',
  },
});

export default MainHeader;
