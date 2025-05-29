'use client';

import React from 'react';
import { StyleSheetManager, ThemeProvider } from 'styled-components';
import isPropValid from '@emotion/is-prop-valid';

interface StyledComponentsProviderProps {
  children: React.ReactNode;
}

// A simple theme for styled-components
const theme = {
  colors: {
    primary: '#0A84FF',
    primaryDark: '#0055D4',
    secondary: '#F0F2F5',
    text: '#1E1E1E',
    lightText: '#9CA3AF',
    border: '#E5E7EB',
    background: '#F9FAFB',
  },
  breakpoints: {
    sm: '480px',
    md: '768px',
    lg: '1024px',
  }
};

export default function StyledComponentsProvider({ children }: StyledComponentsProviderProps) {
  return (
    <StyleSheetManager shouldForwardProp={(prop) => isPropValid(prop)}>
      <ThemeProvider theme={theme}>
        {children}
      </ThemeProvider>
    </StyleSheetManager>
  );
}
