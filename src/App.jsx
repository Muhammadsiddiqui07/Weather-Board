/**
 * Root Application component.
 */

import React from 'react';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';

export default function App() {
  return (
    <ErrorBoundary>
      <Layout>
        <Dashboard />
      </Layout>
    </ErrorBoundary>
  );
}
