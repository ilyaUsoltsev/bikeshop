import { ReactNode } from 'react';

interface PageHeaderProps {
  children: ReactNode;
}

export function PageHeader({ children }: PageHeaderProps) {
  return <h1 className='text-4xl mb-4'>{children}</h1>;
}
