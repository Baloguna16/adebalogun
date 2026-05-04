export const detectedIngredients = [
  'Chicken Thighs', 'Garlic', 'Lemon', 'Olive Oil',
  'Rosemary', 'Potatoes', 'Onion', 'Salt',
];

export const recipeSteps = [
  { text: 'Preheat oven to 425°F.', done: true },
  { text: 'Season chicken thighs with salt, rosemary, and minced garlic.', done: true },
  { text: 'Toss potatoes and onion in olive oil, arrange around chicken in baking dish.', done: false },
  { text: 'Squeeze lemon over everything and drizzle with olive oil.', done: false },
  { text: 'Roast for 35 minutes until chicken is golden and potatoes are crispy.', done: false, timer: '35:00' },
  { text: 'Let rest 5 minutes before serving.', done: false, timer: '5:00' },
];

export const souschefTranscript = {
  question: '"How do I know when the chicken is done?"',
  answer: 'The internal temperature should reach 165°F. The skin will be golden brown and the juices will run clear when you pierce the thickest part.',
};
