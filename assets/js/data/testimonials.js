/**
 * @file Guest reviews rendered into the accessible testimonial carousel.
 * @typedef {object} Testimonial
 * @property {string} id
 * @property {string} quote
 * @property {string} name
 * @property {string} role   Short descriptor shown under the name.
 * @property {number} rating 1–5.
 */

/** @type {Testimonial[]} */
export const TESTIMONIALS = [
  {
    id: 't-adaeze',
    quote:
      'I have eaten jollof on three continents and argued about it on all of them. Iya Bashirat settled the argument for me — that smoke at the bottom of the pot is not a technique, it is a memory.',
    name: 'Adaeze Nwosu',
    role: 'Food writer, Lagos',
    rating: 5,
  },
  {
    id: 't-tunde',
    quote:
      'Every Friday my team walks over from Ozumba Mbadiway for the abula. The amala is smooth, the gbegiri is proper, and nobody has ever rushed us out of a seat.',
    name: 'Tunde Bakare',
    role: 'Regular since 2016',
    rating: 5,
  },
  {
    id: 't-halima',
    quote:
      'I brought my mother, who is impossible to please. She asked for the recipe for the ayamase. She has never asked anyone for a recipe.',
    name: 'Halima Yusuf',
    role: 'Visiting from Kaduna',
    rating: 5,
  },
  {
    id: 't-emeka',
    quote:
      'The catfish pepper soup arrives so hot the steam fogs your glasses. I ordered it during harmattan and genuinely felt reborn. Worth the traffic on Ajayi Crowther.',
    name: 'Emeka Obi',
    role: 'Architect, Victoria Island',
    rating: 4,
  },
  {
    id: 't-sarah',
    quote:
      'As a vegetarian I usually eat rice and pray. Here I got moi moi, dodo and coconut rice, and the waiter knew exactly which soups had crayfish. That care is rare.',
    name: 'Sarah Mensah',
    role: 'Guest from Accra',
    rating: 5,
  },
];
