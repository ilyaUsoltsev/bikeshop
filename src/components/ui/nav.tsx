'use client';

import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Nav({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <nav className='bg-primary text-primary-foreground flex justify-center px-4'>
      {children}
    </nav>
  );
}

export function NavLink(
  props: Omit<React.ComponentProps<typeof Link>, 'className'>
) {
  const pathname = usePathname();
  return (
    <Link
      {...props}
      className={cn(
        'p-4 hover:bg-secondary hover:text-secondary-foreground focus-visible:bg-secondary focus-visible:text-secondary-foreground',
        {
          'bg-background text-foreground': pathname === props.href,
        }
      )}
    />
  );
}
