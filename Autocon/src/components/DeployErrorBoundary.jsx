import React from 'react';
import ErrorCard from './ErrorCard';

export default class DeployErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('[DeployErrorBoundary]', error, info);
  }

  handleRetry = () => {
    this.setState({ error: null });
    this.props.onRetry?.();
  };

  render() {
    if (this.state.error) {
      return (
        <ErrorCard
          message={this.state.error.message}
          onRetry={this.handleRetry}
        />
      );
    }
    return this.props.children;
  }
}
