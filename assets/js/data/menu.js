/**
 * @file Menu data for Iya Bashirat Restaurant.
 * Prices are in Nigerian Naira (NGN), stored as integers to avoid float drift.
 * `art` maps to an inline <symbol> id in the SVG sprite at the foot of index.html.
 */

/**
 * @typedef {'rice' | 'swallow' | 'grill' | 'chops' | 'drinks'} CategoryId
 * @typedef {'vegetarian' | 'vegan' | 'nut-free'} DietTag
 *
 * @typedef {object} Dish
 * @property {string}     id          Stable slug, used as the order-tray key.
 * @property {string}     name        English / common name.
 * @property {string}     native      Yoruba or pidgin name, shown as a subtitle.
 * @property {CategoryId} category
 * @property {number}     price       Price in whole Naira.
 * @property {string}     portion     Human-readable serving size.
 * @property {string}     description One or two sentences of menu copy.
 * @property {number}     spice       Heat, 0–5.
 * @property {DietTag[]}  diet        Dietary tags used by the filter toggles.
 * @property {string[]}   allergens   Displayed on the card for safety.
 * @property {string}     art         Sprite symbol id.
 * @property {boolean}   [signature]  Marks house favourites.
 */

/** @type {{ id: CategoryId, label: string, blurb: string }[]} */
export const CATEGORIES = [
  {
    id: 'rice',
    label: 'Rice & Grains',
    blurb: 'Smoked over firewood the way Mama insists it must be.',
  },
  {
    id: 'swallow',
    label: 'Swallow & Soup',
    blurb: 'Pounded, stretched and ladled hot. Wash your hands.',
  },
  {
    id: 'grill',
    label: 'Grills & Peppered',
    blurb: 'From the coal pit out front, where the smoke never settles.',
  },
  {
    id: 'chops',
    label: 'Small Chops',
    blurb: 'The plate before the plate. Nobody stops at one.',
  },
  {
    id: 'drinks',
    label: 'Drinks',
    blurb: 'Cold enough to forgive the pepper.',
  },
];

/** @type {Dish[]} */
export const DISHES = [
  {
    id: 'party-jollof',
    name: 'Party Jollof Rice',
    native: 'Jollof Ọ̀wàmbẹ̀',
    category: 'rice',
    price: 4500,
    portion: 'Full plate • serves 1',
    description:
      'Long-grain rice steamed in pepper-and-tomato base over firewood until the bottom catches. Served with fried plantain and a boiled egg.',
    spice: 3,
    diet: ['nut-free'],
    allergens: ['Egg'],
    art: 'dish-jollof',
    signature: true,
  },
  {
    id: 'ofada-ayamase',
    name: 'Ofada Rice & Ayamase',
    native: 'Ìrẹsì Ọfadà',
    category: 'rice',
    price: 5200,
    portion: 'Wrapped in ewe eran leaf',
    description:
      'Unpolished local rice with the green pepper sauce bleached in palm oil, heavy with locust bean, ponmo and assorted beef.',
    spice: 4,
    diet: ['nut-free'],
    allergens: [],
    art: 'dish-ofada',
    signature: true,
  },
  {
    id: 'coconut-rice',
    name: 'Coconut Fried Rice',
    native: 'Ìrẹsì Àgbọn',
    category: 'rice',
    price: 4800,
    portion: 'Full plate • serves 1',
    description:
      'Rice simmered in fresh coconut milk with sweet peppers, carrots and green beans. Gentle on the tongue, generous on the plate.',
    spice: 1,
    diet: ['vegetarian', 'nut-free'],
    allergens: [],
    art: 'dish-coconut-rice',
  },
  {
    id: 'pounded-yam-egusi',
    name: 'Pounded Yam & Egusi',
    native: 'Iyán àti Ẹ̀gúsí',
    category: 'swallow',
    price: 5500,
    portion: '2 wraps • soup bowl',
    description:
      'Yam pounded in the mortar at 6am, never a machine. Ladled beside melon-seed soup thick with ugu, stockfish and goat meat.',
    spice: 2,
    diet: [],
    allergens: ['Melon seed', 'Fish', 'Crustacean'],
    art: 'dish-egusi',
    signature: true,
  },
  {
    id: 'abula',
    name: 'Abula — Amala, Ewedu & Gbegiri',
    native: 'Àmàlà Abula',
    category: 'swallow',
    price: 4900,
    portion: '2 wraps • three-part bowl',
    description:
      'Yam-flour amala under the holy trinity: draw-y ewedu, silky bean gbegiri and a slick of buka stew with shaki and bokoto.',
    spice: 2,
    diet: [],
    allergens: [],
    art: 'dish-abula',
    signature: true,
  },
  {
    id: 'eba-ogbono',
    name: 'Eba & Ogbono',
    native: 'Ẹ̀bà àti Ògbónó',
    category: 'swallow',
    price: 4600,
    portion: '2 wraps • soup bowl',
    description:
      'Garri turned smooth and warm, served with wild-mango-seed soup that draws from bowl to mouth in one long, unbroken thread.',
    spice: 2,
    diet: [],
    allergens: ['Fish', 'Crustacean'],
    art: 'dish-ogbono',
  },
  {
    id: 'afang-semo',
    name: 'Afang Soup & Semo',
    native: 'Afang',
    category: 'swallow',
    price: 6000,
    portion: '2 wraps • soup bowl',
    description:
      'An Efik classic we were taught by a friend from Calabar: afang leaf and waterleaf, periwinkle, dried fish and beef.',
    spice: 2,
    diet: [],
    allergens: ['Fish', 'Mollusc', 'Gluten'],
    art: 'dish-afang',
  },
  {
    id: 'suya-platter',
    name: 'Suya Platter',
    native: 'Tsire Suya',
    category: 'grill',
    price: 6500,
    portion: '6 skewers • serves 2',
    description:
      'Beef sliced thin, dressed in yaji groundnut spice and turned over coals by Mallam Sani. Onion, tomato and extra yaji on the side.',
    spice: 4,
    diet: [],
    allergens: ['Groundnut'],
    art: 'dish-suya',
    signature: true,
  },
  {
    id: 'asun',
    name: 'Asun — Peppered Goat',
    native: 'Asun Ewúrẹ́',
    category: 'grill',
    price: 6800,
    portion: 'Small bowl • serves 1–2',
    description:
      'Goat meat smoked till the edges char, then tossed hot in scotch bonnet, onion and a whisper of palm oil.',
    spice: 5,
    diet: ['nut-free'],
    allergens: [],
    art: 'dish-asun',
  },
  {
    id: 'peppered-snail',
    name: 'Peppered Snail',
    native: 'Ìgbín Ata',
    category: 'grill',
    price: 7200,
    portion: '4 pieces',
    description:
      'Giant African land snails cleaned with lime and alum, grilled, then simmered in a fiery ata dindin. Order it with a cold Chapman.',
    spice: 5,
    diet: ['nut-free'],
    allergens: ['Mollusc'],
    art: 'dish-snail',
  },
  {
    id: 'catfish-pepper-soup',
    name: 'Catfish Pepper Soup',
    native: 'Obe Ata Ẹja',
    category: 'grill',
    price: 5800,
    portion: 'Deep bowl',
    description:
      'Fresh catfish in a clear, ferocious broth of uziza, scent leaf and calabash nutmeg. The cure for rain, grief and Monday.',
    spice: 5,
    diet: ['nut-free'],
    allergens: ['Fish'],
    art: 'dish-peppersoup',
  },
  {
    id: 'moi-moi',
    name: 'Moi Moi',
    native: 'Mọ́ínmọ́ín',
    category: 'chops',
    price: 1800,
    portion: '2 wraps',
    description:
      'Peeled beans blended with red pepper and steamed inside ewe eran leaves until it sets like velvet. Ask for the version with egg.',
    spice: 1,
    diet: ['vegetarian', 'vegan', 'nut-free'],
    allergens: [],
    art: 'dish-moimoi',
  },
  {
    id: 'puff-puff',
    name: 'Puff Puff',
    native: 'Bọ́fúlọ́ọ̀',
    category: 'chops',
    price: 1500,
    portion: '6 pieces',
    description:
      'Yeasted dough dropped by hand into hot oil, turning gold and hollow. Dusted with sugar, eaten standing up.',
    spice: 0,
    diet: ['vegetarian', 'vegan', 'nut-free'],
    allergens: ['Gluten'],
    art: 'dish-puffpuff',
  },
  {
    id: 'dodo',
    name: 'Dodo — Fried Plantain',
    native: 'Dòdò',
    category: 'chops',
    price: 1600,
    portion: 'Side bowl',
    description:
      'Overripe plantain, cut on the diagonal and fried till the sugars caramelise at the edge. The peace treaty of Nigerian food.',
    spice: 0,
    diet: ['vegetarian', 'vegan', 'nut-free'],
    allergens: [],
    art: 'dish-dodo',
    signature: true,
  },
  {
    id: 'chapman',
    name: 'Chapman',
    native: 'Chapman',
    category: 'drinks',
    price: 2500,
    portion: 'Tall glass, 40cl',
    description:
      'Lagos in a glass — blackcurrant, Fanta, Sprite, a bitters kick and a wheel of cucumber riding the ice.',
    spice: 0,
    diet: ['vegetarian', 'vegan', 'nut-free'],
    allergens: [],
    art: 'dish-chapman',
    signature: true,
  },
  {
    id: 'zobo',
    name: 'Zobo',
    native: 'Sobolo',
    category: 'drinks',
    price: 1800,
    portion: 'Bottle, 50cl',
    description:
      'Dried hibiscus steeped with pineapple skin, ginger and clove, then chilled overnight. Tart, deep red, no added sugar.',
    spice: 0,
    diet: ['vegetarian', 'vegan', 'nut-free'],
    allergens: [],
    art: 'dish-zobo',
  },
  {
    id: 'kunu-aya',
    name: 'Kunu Aya',
    native: 'Kúnú Àyá',
    category: 'drinks',
    price: 2000,
    portion: 'Bottle, 50cl',
    description:
      'Tigernuts milked by hand with dates and a knot of ginger. Creamy, cold and quietly sweet.',
    spice: 0,
    diet: ['vegetarian', 'vegan', 'nut-free'],
    allergens: [],
    art: 'dish-kunu',
  },
];

/** @type {{ id: DietTag, label: string }[]} */
export const DIET_FILTERS = [
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'nut-free', label: 'Nut-free' },
];
