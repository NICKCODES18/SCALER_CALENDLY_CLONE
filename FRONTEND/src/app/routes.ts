import { createBrowserRouter } from 'react-router';
import { Root } from './pages/Root';
import { LandingPage } from './pages/LandingPage';
import { Dashboard } from './pages/Dashboard';
import { AvailabilityPage } from './pages/AvailabilityPage';
import { BookingPage } from './pages/BookingPage';
import { MeetingsPage } from './pages/MeetingsPage';
import { SettingsPage } from './pages/SettingsPage';
import { AppShell } from './components/layout/AppShell';

/**
 * Marketing landing: /
 * Host app: /scheduling, /availability, /meetings (see AppShell)
 * Public booking: /book/:slug
 */
export const router = createBrowserRouter([
  {
    path: '/',
    Component: Root,
    children: [
      { index: true, Component: LandingPage },
      { path: 'book/:slug', Component: BookingPage },
      {
        Component: AppShell,
        children: [
          { path: 'scheduling', Component: Dashboard },
          { path: 'availability', Component: AvailabilityPage },
          { path: 'meetings', Component: MeetingsPage },
          { path: 'settings', Component: SettingsPage },
        ],
      },
    ],
  },
]);
