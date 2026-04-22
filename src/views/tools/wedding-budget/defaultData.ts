import { Category, Scenario, LineItem, DayAssignment, TodoItem, Venue, uid } from './types';

const item = (name: string, unitCost: number, quantity: number, day: DayAssignment): LineItem => ({
  id: uid(),
  name,
  unitCost,
  quantity,
  day,
  isCustom: false,
  paid: 0,
});

export const createDefaultCategories = (): Category[] => [
  {
    id: uid(),
    name: 'Venue & Rentals',
    items: [
      item('Ceremony venue (church)', 2500, 1, 'Day 2'),
      item('Reception venue rental', 15000, 1, 'Day 2'),
      item('Day 1 venue rental', 5000, 1, 'Day 1'),
      item('Table & chair rentals', 3500, 1, 'Day 2'),
      item('Tent / canopy (if outdoor)', 4000, 1, 'Day 2'),
      item('Restroom trailer', 1200, 1, 'Day 2'),
      item('Lighting & draping', 3000, 1, 'Day 2'),
    ],
  },
  {
    id: uid(),
    name: 'Food & Beverage',
    items: [
      item('Dinner (per guest)', 95, 300, 'Day 2'),
      item('Cocktail hour appetizers', 3500, 1, 'Day 2'),
      item('Day 1 catering (per guest)', 45, 300, 'Day 1'),
      item('Wedding cake', 1500, 1, 'Day 2'),
      item('Open bar (per guest)', 55, 300, 'Day 2'),
      item('Late-night snack station', 1200, 1, 'Day 2'),
      item('Non-alcoholic beverages (Day 1)', 1500, 1, 'Day 1'),
    ],
  },
  {
    id: uid(),
    name: 'Photography & Video',
    items: [
      item('Lead photographer (2 days)', 6000, 1, 'Both'),
      item('Second photographer', 2000, 1, 'Both'),
      item('Videographer (2 days)', 5000, 1, 'Both'),
      item('Drone footage add-on', 800, 1, 'Day 2'),
      item('Photo booth', 1200, 1, 'Day 2'),
      item('Engagement shoot', 500, 1, 'Both'),
    ],
  },
  {
    id: uid(),
    name: 'Flowers & Decor',
    items: [
      item('Bridal bouquet', 350, 1, 'Day 2'),
      item('Bridesmaid bouquets', 100, 6, 'Day 2'),
      item('Boutonnieres', 25, 8, 'Day 2'),
      item('Ceremony arch / altar flowers', 1500, 1, 'Day 2'),
      item('Reception centerpieces', 150, 25, 'Day 2'),
      item('Day 1 decor & flowers', 2000, 1, 'Day 1'),
      item('Aisle decor', 500, 1, 'Day 2'),
    ],
  },
  {
    id: uid(),
    name: 'Attire & Beauty',
    items: [
      item('Wedding dress', 3500, 1, 'Day 2'),
      item('Day 1 outfit (bride)', 1500, 1, 'Day 1'),
      item('Groom suit / tux', 800, 1, 'Day 2'),
      item('Day 1 outfit (groom)', 600, 1, 'Day 1'),
      item('Alterations', 800, 1, 'Both'),
      item('Hair & makeup (bride)', 600, 1, 'Both'),
      item('Bridesmaid hair & makeup', 150, 6, 'Day 2'),
      item('Accessories & jewelry', 500, 1, 'Both'),
    ],
  },
  {
    id: uid(),
    name: 'Music & Entertainment',
    items: [
      item('DJ (reception)', 2500, 1, 'Day 2'),
      item('Live band / musicians', 5000, 1, 'Day 2'),
      item('Ceremony musicians', 800, 1, 'Day 2'),
      item('Day 1 DJ / sound system', 1500, 1, 'Day 1'),
      item('MC / hype man', 500, 1, 'Day 2'),
    ],
  },
  {
    id: uid(),
    name: 'Stationery',
    items: [
      item('Save-the-dates', 250, 1, 'Both'),
      item('Invitations suite', 800, 1, 'Both'),
      item('Programs', 200, 1, 'Day 2'),
      item('Menus', 300, 1, 'Day 2'),
      item('Place cards / seating chart', 250, 1, 'Day 2'),
      item('Thank you cards', 300, 1, 'Both'),
    ],
  },
  {
    id: uid(),
    name: 'Transportation',
    items: [
      item('Bridal party shuttle', 800, 1, 'Day 2'),
      item('Guest shuttle service', 2000, 1, 'Day 2'),
      item('Getaway car', 500, 1, 'Day 2'),
      item('Day 1 transportation', 600, 1, 'Day 1'),
    ],
  },
  {
    id: uid(),
    name: 'Officiant & Ceremony',
    items: [
      item('Church officiant / donation', 500, 1, 'Day 2'),
      item('Marriage license', 50, 1, 'Both'),
      item('Unity ceremony items', 100, 1, 'Day 2'),
    ],
  },
  {
    id: uid(),
    name: 'Traditional Ceremony (Day 1)',
    items: [
      item('Palm wine & kola nut', 300, 1, 'Day 1'),
      item('Traditional wine / drinks', 800, 1, 'Day 1'),
      item('Igba Nkwu items & list', 1500, 1, 'Day 1'),
      item('Cultural MC', 500, 1, 'Day 1'),
    ],
  },
  {
    id: uid(),
    name: 'Favors & Gifts',
    items: [
      item('Guest favors (per guest)', 5, 300, 'Day 2'),
      item('Wedding party gifts', 100, 12, 'Both'),
      item('Parents / family gifts', 200, 4, 'Both'),
      item('Day 1 guest gifts', 3, 300, 'Day 1'),
    ],
  },
  {
    id: uid(),
    name: 'Planning & Coordination',
    items: [
      item('Wedding planner / coordinator', 5000, 1, 'Both'),
      item('Day-of coordinator (if separate)', 2000, 1, 'Day 2'),
      item('Event insurance', 500, 1, 'Both'),
      item('Tips & gratuities', 3000, 1, 'Both'),
    ],
  },
  {
    id: uid(),
    name: 'Miscellaneous',
    items: [
      item('Hotel room block deposit', 1000, 1, 'Both'),
      item('Welcome bags', 8, 100, 'Both'),
      item('Rehearsal dinner', 3000, 1, 'Day 2'),
      item('Emergency / contingency', 3000, 1, 'Both'),
    ],
  },
];

export const createDefaultScenario = (name: string): Scenario => ({
  id: uid(),
  name,
  categories: createDefaultCategories(),
  budgetTarget: 120000,
});

export const createDefaultTodos = (): TodoItem[] => [
  // Venue & Rentals
  { id: uid(), text: 'Book Day 1 venue (Aqua Turf Club)', category: 'Venue & Rentals', completed: false, dueDate: '2026-09-01' },
  { id: uid(), text: 'Book Day 2 venue (Aria Banquets)', category: 'Venue & Rentals', completed: false, dueDate: '2026-09-01' },
  { id: uid(), text: 'Reserve table & chair rentals', category: 'Venue & Rentals', completed: false, dueDate: '2027-06-01' },
  { id: uid(), text: 'Book tent / canopy if needed', category: 'Venue & Rentals', completed: false, dueDate: '2027-05-01' },
  { id: uid(), text: 'Arrange lighting & draping vendor', category: 'Venue & Rentals', completed: false, dueDate: '2027-04-01' },

  // Food & Beverage
  { id: uid(), text: 'Book caterer / finalize menu', category: 'Food & Beverage', completed: false, dueDate: '2027-03-01' },
  { id: uid(), text: 'Schedule cake tasting', category: 'Food & Beverage', completed: false, dueDate: '2027-01-01' },
  { id: uid(), text: 'Decide on bar package', category: 'Food & Beverage', completed: false, dueDate: '2027-04-01' },
  { id: uid(), text: 'Plan Day 1 catering menu', category: 'Food & Beverage', completed: false, dueDate: '2027-05-01' },

  // Photography & Video
  { id: uid(), text: 'Book lead photographer', category: 'Photography & Video', completed: false, dueDate: '2026-12-01' },
  { id: uid(), text: 'Book videographer', category: 'Photography & Video', completed: false, dueDate: '2026-12-01' },
  { id: uid(), text: 'Schedule engagement shoot', category: 'Photography & Video', completed: false, dueDate: '2027-02-01' },
  { id: uid(), text: 'Reserve photo booth', category: 'Photography & Video', completed: false, dueDate: '2027-06-01' },

  // Flowers & Decor
  { id: uid(), text: 'Book florist', category: 'Flowers & Decor', completed: false, dueDate: '2027-01-01' },
  { id: uid(), text: 'Finalize centerpiece designs', category: 'Flowers & Decor', completed: false, dueDate: '2027-06-01' },
  { id: uid(), text: 'Choose ceremony arch style', category: 'Flowers & Decor', completed: false, dueDate: '2027-04-01' },

  // Attire & Beauty
  { id: uid(), text: 'Purchase wedding dress', category: 'Attire & Beauty', completed: false, dueDate: '2027-01-01' },
  { id: uid(), text: 'Purchase groom suit / tux', category: 'Attire & Beauty', completed: false, dueDate: '2027-04-01' },
  { id: uid(), text: 'Shop for Day 1 outfits', category: 'Attire & Beauty', completed: false, dueDate: '2027-03-01' },
  { id: uid(), text: 'Book hair & makeup artist', category: 'Attire & Beauty', completed: false, dueDate: '2027-02-01' },
  { id: uid(), text: 'Schedule dress alterations', category: 'Attire & Beauty', completed: false, dueDate: '2027-06-01' },

  // Music & Entertainment
  { id: uid(), text: 'Book DJ or band for reception', category: 'Music & Entertainment', completed: false, dueDate: '2027-01-01' },
  { id: uid(), text: 'Book ceremony musicians', category: 'Music & Entertainment', completed: false, dueDate: '2027-03-01' },
  { id: uid(), text: 'Book Day 1 DJ / sound system', category: 'Music & Entertainment', completed: false, dueDate: '2027-03-01' },

  // Stationery
  { id: uid(), text: 'Send save-the-dates', category: 'Stationery', completed: false, dueDate: '2026-12-01' },
  { id: uid(), text: 'Order & send invitations', category: 'Stationery', completed: false, dueDate: '2027-05-01' },
  { id: uid(), text: 'Design programs & menus', category: 'Stationery', completed: false, dueDate: '2027-07-01' },
  { id: uid(), text: 'Plan seating chart', category: 'Stationery', completed: false, dueDate: '2027-08-01' },

  // Transportation
  { id: uid(), text: 'Book guest shuttle service', category: 'Transportation', completed: false, dueDate: '2027-05-01' },
  { id: uid(), text: 'Arrange getaway car', category: 'Transportation', completed: false, dueDate: '2027-06-01' },

  // Officiant & Ceremony
  { id: uid(), text: 'Book officiant', category: 'Officiant & Ceremony', completed: false, dueDate: '2026-12-01' },
  { id: uid(), text: 'Get marriage license', category: 'Officiant & Ceremony', completed: false, dueDate: '2027-08-01' },

  // Traditional Ceremony
  { id: uid(), text: 'Source palm wine & kola nut', category: 'Traditional Ceremony (Day 1)', completed: false, dueDate: '2027-07-01' },
  { id: uid(), text: 'Prepare Igba Nkwu items list', category: 'Traditional Ceremony (Day 1)', completed: false, dueDate: '2027-04-01' },
  { id: uid(), text: 'Book cultural MC', category: 'Traditional Ceremony (Day 1)', completed: false, dueDate: '2027-03-01' },

  // Favors & Gifts
  { id: uid(), text: 'Order guest favors', category: 'Favors & Gifts', completed: false, dueDate: '2027-07-01' },
  { id: uid(), text: 'Buy wedding party gifts', category: 'Favors & Gifts', completed: false, dueDate: '2027-08-01' },

  // Planning & Coordination
  { id: uid(), text: 'Hire wedding planner / coordinator', category: 'Planning & Coordination', completed: false, dueDate: '2026-09-01' },
  { id: uid(), text: 'Get event insurance', category: 'Planning & Coordination', completed: false, dueDate: '2027-07-01' },

  // Miscellaneous
  { id: uid(), text: 'Reserve hotel room block', category: 'Miscellaneous', completed: false, dueDate: '2027-03-01' },
  { id: uid(), text: 'Assemble welcome bags', category: 'Miscellaneous', completed: false, dueDate: '2027-08-01' },
  { id: uid(), text: 'Plan rehearsal dinner', category: 'Miscellaneous', completed: false, dueDate: '2027-07-01' },
];

export const createDefaultVenues = (): Venue[] => [
  {
    id: uid(),
    name: 'Aqua Turf Club',
    address: '556 Mulberry Street, Plantsville, CT 06479',
    lat: 41.5801,
    lng: -72.8923,
    day: 'Day 1',
    date: '2027-09-04',
    phone: '(860) 621-9335',
    website: 'https://www.aquaturfclub.com',
    notes: 'Traditional ceremony & Day 1 celebration — 35 acres, gardens, fountains',
  },
  {
    id: uid(),
    name: 'Aria Banquets',
    address: '45 Murphy Road, Prospect, CT 06712',
    lat: 41.5021,
    lng: -72.9784,
    day: 'Day 2',
    date: '2027-09-05',
    phone: '(203) 758-0096',
    website: 'https://www.ariabanquets.com',
    notes: 'Wedding reception & ceremony — Open house Wednesdays',
  },
];
