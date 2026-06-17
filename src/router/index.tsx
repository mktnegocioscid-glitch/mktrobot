import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { PrivateRoute, AdminRoute, GuestRoute } from './guards';
import WidgetDemoPage  from '../pages/widget-demo/WidgetDemoPage';
import LoginPage       from '../pages/auth/LoginPage';
import DashboardPage   from '../pages/dashboard/DashboardPage';
import LeadsPage       from '../pages/leads/LeadsPage';
import BuilderPage     from '../pages/builder/BuilderPage';
import AccountPage     from '../pages/account/AccountPage';
import WidgetsPage     from '../pages/widgets/WidgetsPage';
import AdminPage       from '../pages/admin/AdminPage';

const router = createBrowserRouter([
  { path: '/',       element: <Navigate to="/login" replace /> },
  { path: '/widget', element: <WidgetDemoPage /> },
  { path: '/login',  element: <GuestRoute><LoginPage /></GuestRoute> },

  { path: '/app/dashboard',   element: <PrivateRoute><DashboardPage /></PrivateRoute> },
  { path: '/app/leads',       element: <PrivateRoute><LeadsPage /></PrivateRoute> },
  { path: '/app/leads/:id',   element: <PrivateRoute><LeadsPage /></PrivateRoute> },
  { path: '/app/builder/:id', element: <PrivateRoute><BuilderPage /></PrivateRoute> },
  { path: '/app/widgets',     element: <PrivateRoute><WidgetsPage /></PrivateRoute> },
  { path: '/app/account',     element: <PrivateRoute><AccountPage /></PrivateRoute> },

  { path: '/admin',           element: <AdminRoute><AdminPage /></AdminRoute> },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
