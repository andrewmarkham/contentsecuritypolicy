'use strict';

import { createRoot } from 'react-dom/client';

import "./css/app.css";

import { Typography } from "antd";

import { SecurityHeaders } from './components/SecurityHeaders/SecurityHeaders';

import { CspModule } from './components/Csp/CspModule';
import { ModuleSettings } from './components/Settings/ModuleSettings';
import { PermissionPolicyModule } from './components/PermissionPolicy/PermissionPolicyModule';

import React from 'react';

import { Route,HashRouter, Routes, Navigate } from 'react-router-dom';

import { AppProvider } from './context';
import { SecurityDashboard } from './components/Dashboard/SecurityDashboard';
import { CspIssueSearch } from './components/CspSearch/CspIssueSearch';

function App() {

  const { Title } = Typography;
  
    return (
      <AppProvider>
        <HashRouter>
          <main>    
            <Routes>         
                <Route path="/" element={<SecurityDashboard />} />
                <Route path="/cspissues" element={<CspIssueSearch />} />
                <Route path="/csp" element={<CspModule />} />
                <Route path="/permissions" element={<PermissionPolicyModule />} />
                <Route path="/headers" element={ <SecurityHeaders /> } />
                <Route path="/settings" element={ <ModuleSettings /> } />
            </Routes> 
          </main>
        </HashRouter>
      </AppProvider>
    );
  }


const container = document.getElementById('csp-root');
const root = createRoot(container!);
root.render(<App />);