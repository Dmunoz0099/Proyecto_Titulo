// App.jsx -> componente raíz. Arma las tres capas que sostienen la app:
//  1) <BrowserRouter> -> enrutado por URL
//  2) <AuthProvider>  -> la sesión disponible en toda la app
//  3) <AppRoutes>     -> pinta la página según la ruta actual

import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { AppRoutes } from './routes/AppRoutes.jsx';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
