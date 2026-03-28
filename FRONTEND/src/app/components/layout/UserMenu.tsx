import { Link } from 'react-router';
import { ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';
import { useAuth } from '@/app/context/AuthContext';

const isDefaultUserMode = import.meta.env.VITE_USE_DEFAULT_USER === 'true';

function initials(name: string | null, email: string) {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

export function UserMenu() {
  const { user, logout } = useAuth();

  if (!user) return null;

  const label = user.name?.trim() || user.email;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex min-h-11 items-center gap-2 rounded-full border border-slate-200/90 bg-white py-1.5 pl-1 pr-2 text-sm text-slate-900 shadow-sm shadow-slate-200/30 transition-colors hover:bg-slate-50"
        >
          {user.picture ? (
            <img
              src={user.picture}
              alt=""
              className="size-8 rounded-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <span className="flex size-8 items-center justify-center rounded-full bg-[#E8F1FF] text-xs font-semibold text-[#006bff]">
              {initials(user.name, user.email)}
            </span>
          )}
          <span className="hidden max-w-[140px] truncate pr-1 sm:inline">{label}</span>
          <ChevronDown className="size-4 shrink-0 text-[#6B6B6B]" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem asChild>
          <Link to="/settings">Account Settings</Link>
        </DropdownMenuItem>
        {!isDefaultUserMode && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                void logout();
              }}
            >
              Log out
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
