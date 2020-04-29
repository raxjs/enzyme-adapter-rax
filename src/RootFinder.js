import { createElement, Component } from 'rax';
import PropTypes from 'prop-types';

class RootFinder extends Component {
  render() {
    const { children } = this.props;
    return children;
  }
}
RootFinder.propTypes = {
  children: PropTypes.node,
};
RootFinder.defaultProps = {
  children: null,
};

export default RootFinder;
