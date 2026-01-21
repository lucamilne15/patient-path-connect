import { ReactNode } from 'react';
import { AppSidebar } from './AppSidebar';
import { WalkthroughBanner } from '../walkthrough/WalkthroughBanner';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar />
      <main className="flex-1 flex flex-col">
        <WalkthroughBanner />
        <div className="flex-1 p-8 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
