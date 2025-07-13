import { ReactElement } from 'react';
import { Text, Pressable, StyleSheet, TextStyle, View } from 'react-native';

interface ContentHeaderProps {
  title: string;
  onPress: (title: string) => void;
  headerStyle?: TextStyle;
}

const ContentHeader: React.FC<ContentHeaderProps> = ({
  title,
  onPress,
  headerStyle,
}): ReactElement => {
  const headerInactive = Object.keys(headerStyle!).length === 0;

  return (
    <Pressable onPress={() => onPress(title)}>
      <View style={headerInactive && styles.inactiveHeader}>
        <Text style={headerStyle}>{title}</Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  inactiveHeader: {
    opacity: 0.5,
  },
});

export default ContentHeader;
