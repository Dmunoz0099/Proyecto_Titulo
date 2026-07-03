// AppRoutes.jsx -> el mapa de rutas con React Router.
// Acá se decide qué componente sale en cada URL y cuáles están protegidas.

import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login.jsx';
import Registro from '../pages/Registro.jsx';
import Inicio from '../pages/Inicio.jsx';
import MedicamentosPage from '../features/medicamentos/MedicamentosPage.jsx';
import AgendaPage from '../features/agenda/AgendaPage.jsx';
import JuegosPage from '../features/juegos/JuegosPage.jsx';
import { RutaProtegida } from './RutaProtegida.jsx';

export function AppRoutes() {
  return (
    <Routes>
      {/* pública: login */}
      <Route path="/login" element={<Login />} />

      {/* pública: crear cuenta */}
      <Route path="/registro" element={<Registro />} />

      {/* protegida: solo con sesión iniciada */}
      <Route
        path="/"
        element={
          <RutaProtegida>
            <Inicio />
          </RutaProtegida>
        }
      />

      {/* medicamentos (cualquier rol con sesión) */}
      <Route
        path="/medicamentos"
        element={
          <RutaProtegida>
            <MedicamentosPage />
          </RutaProtegida>
        }
      />

      {/* agenda (cualquier rol con sesión) */}
      <Route
        path="/agenda"
        element={
          <RutaProtegida>
            <AgendaPage />
          </RutaProtegida>
        }
      />

      {/* juegos: solo PACIENTE y CUIDADOR (el FAMILIAR no) */}
      <Route
        path="/juegos"
        element={
          <RutaProtegida roles={['PACIENTE', 'CUIDADOR']}>
            <JuegosPage />
          </RutaProtegida>
        }
      />

      {/* cualquier URL rara -> al inicio */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
