/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ToastContainer } from './components/ui/Primitives';
import { AppProvider, useApp } from './context/AppContext';
import { AdminPage } from './pages/AdminPage';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { FeedbackPage } from './pages/FeedbackPage';
import { LandingPage } from './pages/LandingPage';
import { LessonReaderPage, ModulesPage } from './pages/ModulesPage';
import { ProgressPage } from './pages/ProgressPage';
import { QuizPage } from './pages/QuizPage';
import { ScenariosPage } from './pages/ScenariosPage';

const AppRouter: React.FC = () => {
  const { route, toasts, dismissToast } = useApp();

  const renderPage = () => {
    switch (route) {
      case 'landing':
        return <LandingPage />;
      case 'auth':
        return <AuthPage />;
      case 'dashboard':
        return <DashboardPage />;
      case 'modules':
        return <ModulesPage />;
      case 'lesson':
        return <LessonReaderPage />;
      case 'scenarios':
        return <ScenariosPage />;
      case 'quiz':
        return <QuizPage />;
      case 'feedback':
        return <FeedbackPage />;
      case 'progress':
        return <ProgressPage />;
      case 'admin':
        return <AdminPage />;
      default:
        return <LandingPage />;
    }
  };

  return (
    <>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      {renderPage()}
    </>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppRouter />
    </AppProvider>
  );
}
