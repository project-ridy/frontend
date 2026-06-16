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
        'fixed inset-x-0 bottom-0 z-50 border-t border-border-default bg-surface pb-safe',
        className,
      )}
      aria-label="하단 내비게이션"
    >
      <ul className="mx-auto flex max-w-md items-center justify-around">
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
                  'flex flex-col items-center gap-0.5 px-4 py-2 text-caption transition-colors',
                  isActive
                    ? 'text-primary font-semibold'
                    : 'text-text-secondary hover:text-text-primary',
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
