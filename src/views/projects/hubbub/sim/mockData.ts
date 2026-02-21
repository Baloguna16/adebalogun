export interface Category {
  emoji: string;
  label: string;
}

export interface Product {
  name: string;
  price: string;
  availability: string;
  color: string;
}

export interface Perk {
  icon: string;
  title: string;
  description: string;
}

export const categories: Category[] = [
  { emoji: '🛋️', label: 'Living' },
  { emoji: '🍳', label: 'Kitchen' },
  { emoji: '🏋️', label: 'Fitness' },
  { emoji: '🎮', label: 'Entertainment' },
  { emoji: '💡', label: 'Lighting' },
  { emoji: '⛺', label: 'Outdoors' },
];

export const products: Product[] = [
  { name: 'Standing Desk', price: '$15/week', availability: 'Available now', color: '#69b6e7' },
  { name: 'Instant Pot', price: '$8/week', availability: 'Available now', color: '#e76977' },
  { name: 'Yoga Mat', price: '$5/week', availability: 'Available now', color: '#3d4fe0' },
  { name: 'Projector', price: '$20/week', availability: 'Available Fri', color: '#69b6e7' },
  { name: 'Floor Lamp', price: '$7/week', availability: 'Available now', color: '#e76977' },
  { name: 'Camping Tent', price: '$12/week', availability: 'Available Sat', color: '#3d4fe0' },
];

export const perks: Perk[] = [
  { icon: '🔄', title: 'Flexible ownership', description: 'Rent what you need, return when you\'re done.' },
  { icon: '🚚', title: 'Fast delivery', description: 'Same-day delivery across campus.' },
  { icon: '💬', title: 'Support', description: 'Chat with our team anytime you need help.' },
  { icon: '♻️', title: 'End waste', description: 'Keep items in use instead of landfills.' },
];
