import * as React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Main from './components/Main';
import { useEffect, useState } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseLine from '@mui/material/CssBaseline';

function App() {
  const [files, setFiles] = useState([]);

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: 'dark'
        }
      }),
    []
  );

  useEffect(() => {
    const fetchFiles = async () => {
      const response = await fetch('/sounds.json');
      const files = await response.json();

      setFiles(files);
    };

    fetchFiles();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseLine enableColorScheme={true} />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Main files={files} />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
