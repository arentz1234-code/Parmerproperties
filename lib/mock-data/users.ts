import { User, Role } from '@/types'

export let users: User[] = [
  {
    id: 'user_manager_001',
    email: 'manager@parmerproperties.com',
    name: 'Andrew Rentz',
    passwordHash: 'password123',
    role: Role.MANAGER,
    phone: '(334) 555-0101',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: 'user_tenant_001',
    email: 'tenant1@demo.com',
    name: 'Sarah Mitchell',
    passwordHash: 'password123',
    role: Role.TENANT,
    phone: '(334) 555-0201',
    createdAt: new Date('2025-03-10'),
    updatedAt: new Date('2025-03-10'),
  },
  {
    id: 'user_owner_001',
    email: 'owner@demo.com',
    name: 'James Parmer',
    passwordHash: 'password123',
    role: Role.OWNER,
    phone: '(334) 555-0301',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
]
