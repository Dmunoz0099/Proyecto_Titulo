// main.jsx -> punto de entrada del front. Monta <App /> dentro del
// <div id="root"> de index.html.

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

// estilos globales (incluye la paleta como variables CSS). Al importarlo acá
// aplica a toda la app.
import './styles/global.css';

// sistema de diseño compartido (tarjetas, botones, tiles, modal, AppBar…).
// Va después de global.css para que las clases .btn/.icon-btn puedan pisar los <button> base.
import './styles/cuidamayor.css';

// createRoot arma la raíz de React 18 y render() pinta la app.
// <React.StrictMode> mete chequeos extra en desarrollo.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
