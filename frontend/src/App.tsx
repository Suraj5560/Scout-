import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Landing } from './pages/Landing';
import { Radar } from './pages/Radar';
import { Styleguide } from './pages/Styleguide';
import { initSmoothScroll, destroySmoothScroll } from './lib/scroll';

const App: React.FC = () => {
  useEffect(() => {
    const lenis = initSmoothScroll();
    return () => {
      destroySmoothScroll();
    };
  }, []);

  return (
    <BrowserRouter>
      {/* Native browser cursor restored (mouse-follower removed) */}
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/app" element={<Radar />} />
        <Route path="/radar" element={<Radar />} />
        <Route path="/styleguide" element={<Styleguide />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
