import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

export type PdfTemplate = 'classic' | 'modern';

type SettingsContextType = {
  pdfTemplate: PdfTemplate;
  setPdfTemplate: (template: PdfTemplate) => Promise<void>;
};

const SettingsContext = createContext<SettingsContextType>({
  pdfTemplate: 'classic',
  setPdfTemplate: async () => {},
});

export const useSettings = () => useContext(SettingsContext);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [pdfTemplate, setPdfTemplateState] = useState<PdfTemplate>('classic');

  useEffect(() => {
    AsyncStorage.getItem('pdfTemplate').then((stored) => {
      if (stored === 'classic' || stored === 'modern') {
        setPdfTemplateState(stored);
      }
    });
  }, []);

  const setPdfTemplate = useCallback(async (template: PdfTemplate) => {
    setPdfTemplateState(template);
    await AsyncStorage.setItem('pdfTemplate', template);
  }, []);

  return (
    <SettingsContext.Provider value={{ pdfTemplate, setPdfTemplate }}>
      {children}
    </SettingsContext.Provider>
  );
}
