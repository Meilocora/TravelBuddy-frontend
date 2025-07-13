function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
import React from 'react';
import { StyleSheet } from 'react-native';
import useEventStore from '../hooks/use-event-store';
import EventContext from '../event-context';
import Container from './container';
export default function EventProvider(props) {
  const {
    style,
    ...rest
  } = props;
  const eventStore = useEventStore();
  return /*#__PURE__*/React.createElement(EventContext.Provider, {
    value: eventStore
  }, /*#__PURE__*/React.createElement(Container, _extends({
    style: [styles.container, style]
  }, rest), props.children));
}
const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});
//# sourceMappingURL=event-provider.js.map