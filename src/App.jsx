import Main from './components/Main';
import { useEffect, useState } from 'react';

function App() {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    fetch('/sounds.json')
      .then(response => response.json())
      .then(setFiles);
  }, []);

  return <Main files={files} />;
}

export default App;
