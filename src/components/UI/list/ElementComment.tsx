import { ReactElement } from 'react';
import { Text, StyleSheet } from 'react-native';

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
  },
});

export default ElementComment;
