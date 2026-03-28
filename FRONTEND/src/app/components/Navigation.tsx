import { Link, useLocation } from 'react-router';
import { Calendar, Clock, Home, Settings } from 'lucide-react';

export function Navigation() {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/scheduling" className="flex items-center space-x-2">
              <Calendar className="size-8 text-[#006bff]" />
              <span className="text-xl font-bold text-slate-900">Calendly</span>
            </Link>
          </div>

          <div className="flex space-x-1">
            <Link
              to="/scheduling"
              className={`flex items-center space-x-2 rounded-lg px-4 py-2 transition-colors ${
                isActive('/scheduling') ? 'bg-blue-50 text-[#006bff]' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Home className="w-5 h-5" />
              <span className="font-medium">Dashboard</span>
            </Link>

            <Link
              to="/availability"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                isActive('/availability') ? 'bg-blue-50 text-[#006bff]' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Clock className="w-5 h-5" />
              <span className="font-medium">Availability</span>
            </Link>

            <Link
              to="/meetings"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                isActive('/meetings') ? 'bg-blue-50 text-[#006bff]' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Settings className="w-5 h-5" />
              <span className="font-medium">Meetings</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
