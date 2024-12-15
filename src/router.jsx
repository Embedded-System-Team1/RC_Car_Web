import { Route, createBrowserRouter, createRoutesFromElements } from 'react-router-dom';
import ControlPage from './pages/ControlPage.jsx';
import IPInputPage from './pages/IPInputPage.jsx';

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/'>
      <Route path='' element={<IPInputPage />} />
      <Route path='control' element={<ControlPage />} />
    </Route>
  )
);
