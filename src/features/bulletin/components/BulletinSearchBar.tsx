'use client';

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group';
import { Search } from 'lucide-react';

export default function BulletinSearchBar() {
  return (
    <InputGroup className="w-full sm:w-56">
      <InputGroupInput placeholder="Search..." />
      <InputGroupAddon align="inline-end">
        <Search />
      </InputGroupAddon>
    </InputGroup>
  );
}
