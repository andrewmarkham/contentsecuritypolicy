'use strict';

import { createRoot } from 'react-dom/client';

import "./css/app.css";

import { SecurityHeaders } from './Features/SecurityHeaders/SecurityHeaders';

import { CspModule } from './Features/Csp/CspModule/CspModule';
import { ModuleSettings } from './Features/Settings/ModuleSettings/ModuleSettings';
import { PermissionPolicyModule } from './Features/PermissionPolicy/PermissionPolicyModule/PermissionPolicyModule';

import React from 'react';

import { Route, HashRouter, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SecurityDashboard } from './Features/Dashboard/SecurityDashboard/SecurityDashboard';
import { CspIssueSearch } from './Features/CspSearch/CspIssueSearch/CspIssueSearch';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
    return (
      <QueryClientProvider client={queryClient}>
        <HashRouter>
          <main>
            <Routes>
              <Route path="/" element={<SecurityDashboard />} />
              <Route path="/cspissues" element={<CspIssueSearch />} />
              <Route path="/csp" element={<CspModule />} />
              <Route path="/permissions" element={<PermissionPolicyModule />} />
              <Route path="/headers" element={<SecurityHeaders />} />
              <Route path="/settings" element={<ModuleSettings />} />
            </Routes>
          </main>
        </HashRouter>
      </QueryClientProvider>
    );
  }


const container = document.getElementById('csp-root');
const root = createRoot(container!);
root.render(<App />);
