'use client';

import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div>
      <Button onClick={() => console.log('hello')}>Click me</Button>
    </div>
  );
}
