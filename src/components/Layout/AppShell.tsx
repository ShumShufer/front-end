import { Link, Outlet } from 'react-router-dom';
import { ROUTES } from '../../router/routes.config.ts';

interface AppShellProps {
  roleLabel: string;
  homePath: string;
}

export function AppShell({ roleLabel, homePath }: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-56 shrink-0 border-r border-gray-200 bg-white p-4">
        <Link to={homePath} className="mb-6 block text-lg font-semibold text-gray-900">
          Shumshufer
        </Link>
        <p className="mb-4 text-xs font-medium uppercase tracking-wide text-gray-400">
          {roleLabel}
        </p>
        <nav className="space-y-1 text-sm text-gray-600">
          <Link to={homePath} className="block rounded px-2 py-1.5 hover:bg-gray-100">
            Dashboard
          </Link>
          <Link
            to={ROUTES.shared.notifications}
            className="block rounded px-2 py-1.5 hover:bg-gray-100"
          >
            Notifications
          </Link>
          <Link to={ROUTES.auth.login} className="block rounded px-2 py-1.5 hover:bg-gray-100">
            Logout (placeholder)
          </Link>
        </nav>
      </aside>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
