import { Link, Outlet } from 'react-router-dom';
import { ROUTES } from '../../router/routes.config.ts';

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to={ROUTES.public.landing} className="text-lg font-semibold text-gray-900">
            Shumshufer
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link to={ROUTES.public.schools} className="text-gray-600 hover:text-gray-900">
              Schools
            </Link>
            <Link to={ROUTES.public.courses} className="text-gray-600 hover:text-gray-900">
              Courses
            </Link>
            <Link to={ROUTES.auth.login} className="text-gray-600 hover:text-gray-900">
              Login
            </Link>
            <Link
              to={ROUTES.auth.register}
              className="rounded-md bg-gray-900 px-3 py-1.5 text-white hover:bg-gray-800"
            >
              Register
            </Link>
          </nav>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
