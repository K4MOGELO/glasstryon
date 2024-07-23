import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import TryOnButton from './PAGES/GlassPage';
import NewVirtualTryOn from './PAGES/NewVirtualTryOn';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TryOnButton />} />
        <Route path="/glasses/" element={<NewVirtualTryOn />} />
        <Route path="/glasses/:glassesId" element={<NewVirtualTryOn />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
