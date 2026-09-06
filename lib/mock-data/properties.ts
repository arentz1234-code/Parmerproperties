import { Property, PropertyType } from '@/types'

export let properties: Property[] = [
  {
    id: 'prop_rv1',
    name: 'Richland Village',
    address: '538 Richland Road',
    city: 'Auburn',
    state: 'AL',
    zip: '36830',
    type: PropertyType.TOWNHOUSE,
    description:
      'Mixed-use townhouse community featuring three distinct floor plans — Cotswold, Windsor, and Kensington — plus two ground-floor commercial retail spaces. Located in the heart of Auburn near campus.',
    yearBuilt: 2019,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: 'prop_bab',
    name: 'Bragg Avenue Brownstones',
    address: '152 Bragg Ave',
    city: 'Auburn',
    state: 'AL',
    zip: '36830',
    type: PropertyType.APARTMENT,
    description:
      'Eight luxury urban row homes, each 5BD/5.5BA at 2,772 sqft. Premium finishes throughout, ideal for Auburn University students seeking upscale accommodations within walking distance of campus.',
    yearBuilt: 2021,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: 'prop_jac',
    name: 'Judd Avenue Cottages',
    address: '533 Judd Ave',
    city: 'Auburn',
    state: 'AL',
    zip: '36830',
    type: PropertyType.HOUSE,
    description:
      'Sixteen charming cottages situated near Auburn campus in three distinct floor plans — Cottage A, B, and C. Private yards, modern interiors, and a walkable neighborhood make this a popular choice for Auburn students.',
    yearBuilt: 2020,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: 'prop_rv3',
    name: 'Richland Village III',
    address: '1256 Shug Jordan Pkwy',
    city: 'Auburn',
    state: 'AL',
    zip: '36830',
    type: PropertyType.TOWNHOUSE,
    description:
      'Newest addition to the Richland Village brand with eleven townhouse units in four configurations — 2BD, 3BD, 4BD Standard, 4BD Mirrored, and executive Cottage units with private office. Now pre-leasing for Fall 2027.',
    yearBuilt: 2025,
    createdAt: new Date('2025-06-01'),
    updatedAt: new Date('2025-06-01'),
  },
]
