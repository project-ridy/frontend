'use client';

import { Home, MessageCircle, Search, User } from 'lucide-react';

import { cn } from '@/lib/utils';

const iconMap = {
  home: Home,
  search: Search,
  chat: MessageCircle,
  profile: User,
} as const;

type IconId = keyof typeof iconMap;

interface NavTab {
  id: string;
  label: string;
  icon: IconId;
}

interface BottomNavigationProps {
  tabs: NavTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export function BottomNavigation({
  tabs,
  activeTab,
  onTabChange,
  className,
}: BottomNavigationProps) {
  return (
    <nav
      className={cn(
        'fixed inset-x-0 bottom-0 z-50 border-t border-white/70 bg-surface-raised/92 bg-surface-raised px-4 pb-safe pt-2 shadow-4 backdrop-blur-xl supports-[padding:max(0px)]:pb-[max(env(safe-area-inset-bottom),0.75rem)]',
        className,
      )}
      aria-label="하단 내비게이션"
    >
      <ul className="mx-auto flex max-w-md items-center justify-between rounded-[2rem] border border-border-subtle bg-white/85 px-2 py-1 shadow-1">
        {tabs.map((tab) => {
          const Icon = iconMap[tab.icon];
          const isActive = tab.id === activeTab;

          return (
            <li key={tab.id}>
              <button
                type="button"
                aria-label={tab.label}
                aria-current={isActive ? 'page' : undefined}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  'flex min-h-11 min-w-14 flex-col items-center gap-0.5 rounded-pill px-3 py-2 text-caption transition-all duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                  isActive
                    ? 'bg-primary-subtle text-primary font-semibold shadow-[0_8px_20px_rgba(37,99,235,0.14)]'
                    : 'text-text-secondary hover:bg-surface-secondary hover:text-text-primary',
                )}
              >
                <Icon aria-hidden="true" size={20} />
                <span>{tab.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
