import { ReactElement } from 'react';
import { Text, StyleSheet } from 'react-native';
import { GlobalStyles } from '../../../constants/styles';

interface ElementCommentProps {
  content: string;
}

const ElementComment: React.FC<ElementCommentProps> = ({
  content,
}): ReactElement => {
  return <Text style={styles.comment}>{content}</Text>;
};

const styles = StyleSheet.create({
  comment: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    color: GlobalStyles.colors.grayMedium,
    opacity: 0.7,
  },
});

export default ElementComment;
