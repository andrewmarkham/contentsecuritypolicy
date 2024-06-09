'use strict';

import { createRoot } from 'react-dom/client';

import "./css/app.css";

import { Typography } from "antd";

import { SecurityHeaders } from './components/securityheaders/SecurityHeaders';

import {CspModule} from './components/csp/CspModule';

import React from 'react';

import { Route,HashRouter, Routes, Navigate } from 'react-router-dom';

import { AppProvider } from './context';

function App() {

  const { Title } = Typography;
  
    return (
      <AppProvider>
        <HashRouter>
          <main>    
            <Routes>         
                <Route path="/" element={<Navigate to="/csp" replace={true} />} />
                <Route path="/csp" element={<CspModule />} />
                <Route path="/headers" element={ <SecurityHeaders /> } />
            </Routes> 
          </main>
        </HashRouter>
      </AppProvider>
    );
  }


const container = document.getElementById('csp-root');
const root = createRoot(container!);
root.render(<App />);