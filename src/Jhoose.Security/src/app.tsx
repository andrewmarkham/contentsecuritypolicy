'use strict';

import { createRoot } from 'react-dom/client';

import "./css/app.css";

import { Typography } from "antd";

import { SecurityHeaders } from './components/securityheaders/SecurityHeaders';

import {CspModule} from './components/csp/CspModule';
import {ModuleSettings} from './components/settings/ModuleSettings';

import React from 'react';

import { Route,HashRouter, Routes, Navigate } from 'react-router-dom';

import { AppProvider } from './context';
import { SecurityDashboard } from './components/dashboard/SecurityDashboard';
import { CspIssueSearch } from './components/cspsearch/CspIssueSearch';

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