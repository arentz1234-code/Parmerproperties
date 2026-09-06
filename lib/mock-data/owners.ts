import { Owner, PropertyOwnership } from '@/types'

export let owners: Owner[] = [
  {
    id: 'owner_001',
    userId: 'user_owner_001',
    firstName: 'James',
    lastName: 'Parmer',
    email: 'owner@demo.com',
    phone: '(334) 555-0301',
    address: '100 Parmer Way, Auburn, AL 36830',
    taxId: '***-**-6789',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
]

export let propertyOwnerships: PropertyOwnership[] = [
  {
    id: 'own_rv1',
    propertyId: 'prop_rv1',
    ownerId: 'owner_001',
    ownershipShare: 100,
    startDate: new Date('2024-01-01'),
  },
  {
    id: 'own_bab',
    propertyId: 'prop_bab',
    ownerId: 'owner_001',
    ownershipShare: 100,
    startDate: new Date('2024-01-01'),
  },
  {
    id: 'own_jac',
    propertyId: 'prop_jac',
    ownerId: 'owner_001',
    ownershipShare: 100,
    startDate: new Date('2024-01-01'),
  },
  {
    id: 'own_rv3',
    propertyId: 'prop_rv3',
    ownerId: 'owner_001',
    ownershipShare: 100,
    startDate: new Date('2025-06-01'),
  },
]
