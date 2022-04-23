import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Login from './Login';
import Room from './Room';

function App() {
  return (
    <Routes>
      <Route path='/' element={<Login />} />
      <Route path='/:room' element={<Room />} />
    </Routes>
  );
}

export default App;
