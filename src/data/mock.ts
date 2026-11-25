// Mock data for the OYO Food vendor portal.
// Replace with real API calls once the backend exists.

export type OrderStatus = 'incoming' | 'prep' | 'ready' | 'completed' | 'cancelled'

export interface OrderItem {
  qty: number
  name: string
  detail?: string
  price: number
}

export interface Order {
  id: string
  customer: string
  phone: string
  address: string
  items: OrderItem[]
  note?: string
  method: 'Delivery' | 'Pickup'
  paid: string
  status: OrderStatus
  placedAt: string
  minsAgo: number
  distanceKm?: number
  rider?: { name: string; phone: string }
  prepMins?: number
  prepLeft?: number
}

export const vendor = {
  owner: 'Babatunde Adeleke',
  role: 'General Manager',
  brand: 'Bukka Hut Kitchen',
  branch: 'Bukka Hut - Bodija Branch',
  location: 'Ibadan North, Oyo State',
  id: '#OYO-VND-4091',
  email: 'babatunde@bukkahut.ng',
  phone: '+234 801 234 5678',
  bio: 'Authentic Nigerian buka delicacies cooked over natural woodfire. Renowned for party jollof rice, assorted amala abula with goat meat, and spicy grilled suya platters.',
  bank: { name: 'Guaranty Trust Bank (GTBank)', nuban: '0124859302', accountName: 'BUKKA HUT KITCHEN NIG LTD' },
}

export const COMMISSION = 0.15
export const PACKAGING_FEE = 300

export const initialOrders: Order[] = [
  {
    id: 'OYO-9821',
    customer: 'Folashade Alakija',
    phone: '081 2234 5678',
    address: 'Plot 12, Awolowo Avenue, Old Bodija, Ibadan',
    items: [
      { qty: 2, name: 'Special Smoky Jollof Rice', detail: 'Protein Choice: Spicy Peppered Quarter Chicken • Spice Level: Hot', price: 5600 },
      { qty: 1, name: 'Extra Fried Ripe Plantain (Dodo Portion)', detail: '6 pieces • Crispy cut', price: 1000 },
      { qty: 1, name: 'Chilled Maltina Can (330ml)', detail: 'Beverage • Extra Cold', price: 600 },
    ],
    note: 'Please pack pepper sauce separately in a small container. Do not pour on plantains.',
    method: 'Delivery',
    paid: 'Card / Bank Transfer',
    status: 'incoming',
    placedAt: '01:24 PM',
    minsAgo: 1,
    distanceKm: 3.4,
  },
  {
    id: 'OYO-9822',
    customer: 'Gbenga Adeniyi',
    phone: '080 3345 1209',
    address: 'Bodija Estate, Ibadan',
    items: [
      { qty: 3, name: 'Bukka Special Assorted Goat Meat Platter', price: 12000 },
      { qty: 2, name: 'Cold Chapman Jug', price: 2500 },
    ],
    method: 'Delivery',
    paid: 'Paid Online (Paystack)',
    status: 'incoming',
    placedAt: '01:22 PM',
    minsAgo: 3,
    distanceKm: 1.9,
  },
  {
    id: 'OYO-9823',
    customer: 'Aisha Bello',
    phone: '090 5512 8890',
    address: 'UI Second Gate, Ibadan',
    items: [{ qty: 1, name: 'Amala with Gbegiri & Ewedu (Abula)', detail: 'Assorted meat', price: 3500 }],
    method: 'Pickup',
    paid: 'Paid Online (Paystack)',
    status: 'incoming',
    placedAt: '01:20 PM',
    minsAgo: 5,
  },
  {
    id: 'OYO-9824',
    customer: 'Chinedu Okafor',
    phone: '081 7788 1122',
    address: 'Agodi GRA, Ibadan',
    items: [
      { qty: 2, name: 'Special Grilled Beef Suya (Quarter Cut)', price: 9000 },
      { qty: 1, name: 'Zobo 500ml', price: 800 },
    ],
    method: 'Delivery',
    paid: 'Card / Bank Transfer',
    status: 'incoming',
    placedAt: '01:18 PM',
    minsAgo: 7,
    distanceKm: 4.2,
  },
  {
    id: 'OYO-9825',
    customer: 'Yetunde Bakare',
    phone: '070 1234 9876',
    address: 'Samonda, Ibadan',
    items: [{ qty: 1, name: 'Special Smoky Party Jollof Rice', price: 2800 }],
    note: 'Extra pepper please',
    method: 'Delivery',
    paid: 'Paid Online (Paystack)',
    status: 'incoming',
    placedAt: '01:15 PM',
    minsAgo: 10,
    distanceKm: 2.7,
  },
  {
    id: 'OYO-9818',
    customer: 'Ibrahim Danladi',
    phone: '080 9876 5432',
    address: 'Secretariat, Ibadan',
    items: [{ qty: 1, name: 'Amala with Goat Meat & Gbegiri', price: 4800 }],
    method: 'Pickup',
    paid: 'Paid Online (Paystack)',
    status: 'prep',
    placedAt: '01:02 PM',
    minsAgo: 22,
    prepMins: 20,
    prepLeft: 8,
  },
  {
    id: 'OYO-9819',
    customer: 'Kemi Adewale',
    phone: '081 2290 4411',
    address: 'Old Bodija, Ibadan',
    items: [{ qty: 2, name: 'Special Smoky Party Jollof Rice', price: 5600 }],
    method: 'Delivery',
    paid: 'Card / Bank Transfer',
    status: 'prep',
    placedAt: '01:05 PM',
    minsAgo: 19,
    prepMins: 20,
    prepLeft: 11,
  },
  {
    id: 'OYO-9820',
    customer: 'Musa Abdullahi',
    phone: '090 3321 7788',
    address: 'UI, Ibadan',
    items: [{ qty: 1, name: 'Spicy Beef Suya Platter', price: 3500 }],
    method: 'Delivery',
    paid: 'Paid Online (Paystack)',
    status: 'prep',
    placedAt: '01:08 PM',
    minsAgo: 16,
    prepMins: 15,
    prepLeft: 4,
  },
  {
    id: 'OYO-9815',
    customer: 'Emeka Nwosu',
    phone: '090 1122 3344',
    address: 'Agodi GRA, Ibadan',
    items: [
      { qty: 3, name: 'Beef Suya', price: 9000 },
      { qty: 2, name: 'Chilled Chapman', price: 2500 },
    ],
    method: 'Delivery',
    paid: 'Card / Bank Transfer',
    status: 'ready',
    placedAt: '12:48 PM',
    minsAgo: 36,
    rider: { name: 'Kayode A.', phone: '08055443322' },
  },
  ...['OYO-9811', 'OYO-9812', 'OYO-9813'].map(
    (id, i): Order => ({
      id,
      customer: ['Tola Ogunleye', 'Bisi Adams', 'Femi Olatunji'][i],
      phone: '080 0000 000' + i,
      address: 'Bodija, Ibadan',
      items: [{ qty: 1, name: 'Special Smoky Party Jollof Rice', price: 2800 + i * 500 }],
      method: i === 1 ? 'Pickup' : 'Delivery',
      paid: 'Paid Online (Paystack)',
      status: 'ready',
      placedAt: '12:4' + i + ' PM',
      minsAgo: 40 + i,
      rider: i === 1 ? undefined : { name: ['Sule M.', '', 'Bayo T.'][i], phone: '0803000000' + i },
    }),
  ),
  ...Array.from({ length: 6 }, (_, i): Order => ({
    id: 'OYO-97' + (90 + i),
    customer: ['Folashade Adeleke', 'Tunde Oladipo', 'Grace Eze', 'Segun Ajayi', 'Halima Yusuf', 'Dayo Coker'][i],
    phone: '080 1111 22' + (10 + i),
    address: 'Ibadan',
    items: [{ qty: 1 + (i % 2), name: ['Party Jollof Combo', 'Amala Abula Meal', 'Suya Platter'][i % 3], price: 4200 + i * 700 }],
    method: i % 3 === 0 ? 'Pickup' : 'Delivery',
    paid: 'Paid Online (Paystack)',
    status: 'completed',
    placedAt: '11:' + (10 + i * 7) + ' AM',
    minsAgo: 120 + i * 10,
  })),
  {
    id: 'OYO-9788',
    customer: 'Peter Obi-Nnaji',
    phone: '081 4545 9090',
    address: 'Mokola, Ibadan',
    items: [{ qty: 1, name: 'Special Grilled Beef Suya (Quarter Cut)', price: 4500 }],
    method: 'Delivery',
    paid: 'Refunded',
    status: 'cancelled',
    placedAt: '10:40 AM',
    minsAgo: 160,
  },
  {
    id: 'OYO-9784',
    customer: 'Ngozi Umeh',
    phone: '080 7878 1212',
    address: 'Dugbe, Ibadan',
    items: [{ qty: 2, name: 'Amala Abula Meal', price: 7000 }],
    method: 'Delivery',
    paid: 'Refunded',
    status: 'cancelled',
    placedAt: '10:12 AM',
    minsAgo: 190,
  },
]

export interface Meal {
  id: string
  name: string
  description: string
  price: number
  discountPrice?: number
  category: string
  prepTime: string
  options: string
  soldThisWeek: number
  available: boolean
  image: string
  lowStock?: boolean
}

export const categories = ['Rice & Pastas', 'Swallow & Native Soups', 'Grills & Suya', 'Sides & Beverages']

export const initialMeals: Meal[] = [
  {
    id: 'm1',
    name: 'Special Smoky Party Jollof Rice',
    description: 'Classic firewood-infused Nigerian party jollof rice served with seasoned sweet fried plantain and coleslaw.',
    price: 2800,
    category: 'Rice & Pastas',
    prepTime: '15-20 mins',
    options: '4 Protein Options',
    soldThisWeek: 182,
    available: true,
    image: '/images/meal1.jpg',
  },
  {
    id: 'm2',
    name: 'Amala with Gbegiri & Ewedu (Abula)',
    description: 'Smooth fluffy black yam flour swallow paired with traditional golden gbegiri bean broth, ewedu and buka stew.',
    price: 3500,
    category: 'Swallow & Native Soups',
    prepTime: '15 mins',
    options: 'Assorted Meat / Goat',
    soldThisWeek: 94,
    available: true,
    image: '/images/meal2.jpg',
  },
  {
    id: 'm3',
    name: 'Special Grilled Beef Suya (Quarter Cut)',
    description: 'Tender grilled boneless beef strips infused with signature roasted kuli-kuli yaji spices and fresh onions.',
    price: 4500,
    category: 'Grills & Suya',
    prepTime: '20 mins',
    options: 'Mild / Hot',
    soldThisWeek: 61,
    available: false,
    image: '/images/meal3.jpg',
    lowStock: true,
  },
]

export const addOns = [
  { name: 'Extra Pepper Sauce Cup', price: 300 },
  { name: 'Grilled Chicken Drumstick', price: 1800 },
  { name: 'Fried Sweet Plantain (Dodo)', price: 1000 },
]

export const hourlySales = [
  { t: '9 AM', v: 8000 },
  { t: '10 AM', v: 14500 },
  { t: '11 AM', v: 26000 },
  { t: '12 PM', v: 48000 },
  { t: '1 PM', v: 71200 },
  { t: '2 PM', v: 63500 },
  { t: '3 PM', v: 37000 },
  { t: '4 PM', v: 18500 },
  { t: '5 PM', v: 15000 },
  { t: '6 PM', v: 22000 },
  { t: '7 PM', v: 24500 },
]

export const weeklySales = [
  { t: 'Mon', v: 296000 },
  { t: 'Tue', v: 274000 },
  { t: 'Wed', v: 312000 },
  { t: 'Thu', v: 301000 },
  { t: 'Fri', v: 389000 },
  { t: 'Sat', v: 412000 },
  { t: 'Sun', v: 455000 },
]

export const topMeals = [
  { name: 'Smoky Jollof & Chicken', orders: '38 orders', revenue: 106400, growth: 24 },
  { name: 'Amala with Gbegiri & Ewedu', orders: '29 orders', revenue: 92800, growth: 18 },
  { name: 'Spicy Beef Suya Platter', orders: '21 orders', revenue: 73500, growth: 9 },
  { name: 'Fried Plantain (Dodo Portion)', orders: '45 add-ons', revenue: 45000, growth: 31 },
]

export const weeklyRevenue = [
  { week: 'Week 1', delivery: 0.62, pickup: 0.36 },
  { week: 'Week 2', delivery: 0.74, pickup: 0.41 },
  { week: 'Week 3', delivery: 0.86, pickup: 0.46 },
  { week: 'Week 4 (Peak)', delivery: 0.95, pickup: 0.49 },
]

export const peakHours = [
  { label: '12:00 PM - 02:30 PM', sub: '(Lunch Rush)', pct: 48, color: 'bg-brand', text: 'text-brand' },
  { label: '06:00 PM - 09:30 PM', sub: '(Dinner & Grills)', pct: 36, color: 'bg-ink', text: 'text-ink' },
  { label: '08:30 AM - 11:30 AM', sub: '(Breakfast / Early)', pct: 16, color: 'bg-gray-500', text: 'text-muted' },
]

export const categoryPerformance = [
  { name: 'Rice & Pastas', items: '10 Meals', units: '542 Orders', revenue: 2168000, share: 44.3, growth: 18.5 },
  { name: 'Swallow & Native Soups', items: '8 Meals', units: '312 Orders', revenue: 1435200, share: 29.3, growth: 14.2 },
  { name: 'Grills & Suya', items: '6 Meals', units: '188 Orders', revenue: 846000, share: 17.3, growth: 28.1 },
  { name: 'Sides & Beverages', items: '10 Items', units: '410 Add-ons', revenue: 443100, share: 9.1, growth: 34.0 },
]

export const transactions = [
  { ref: 'PAY-OYO-09281', date: '10 Nov 2026, 06:15 AM', type: 'Daily Bank Payout', gross: 312400, commission: 0, net: 312400, status: 'payout' as const },
  { ref: 'ORD-OYO-9815', date: '11 Nov 2026, 01:10 PM', type: 'Order: 3x Suya + Drinks', gross: 11500, commission: 1725, net: 9775, status: 'cleared' as const },
  { ref: 'ORD-OYO-9802', date: '11 Nov 2026, 12:45 PM', type: 'Order: 2x Amala Abula Meal', gross: 7000, commission: 1050, net: 5950, status: 'cleared' as const },
  { ref: 'ORD-OYO-9794', date: '11 Nov 2026, 11:20 AM', type: 'Order: Party Jollof Combo', gross: 4200, commission: 630, net: 3570, status: 'cleared' as const },
  { ref: 'PAY-OYO-09244', date: '09 Nov 2026, 06:15 AM', type: 'Daily Bank Payout', gross: 287950, commission: 0, net: 287950, status: 'payout' as const },
]

export interface Review {
  id: string
  name: string
  rating: number
  when: string
  verified: string
  order: string
  text: string
  items?: string[]
  reply?: { text: string; when: string }
  hasPhoto?: boolean
}

export const initialReviews: Review[] = [
  {
    id: 'r1',
    name: 'Folashade Adeleke',
    rating: 5,
    when: 'Yesterday at 2:40 PM',
    verified: 'Verified OYO Delivery Order',
    order: '#OYO-9781',
    text: 'The party jollof rice was exceptionally smoky, exactly how traditional wedding rice tastes! Chicken was tender and deeply seasoned, and the plantains were sweet. Fast delivery to Bodija within 25 minutes. Will definitely be making Bukka Hut my daily lunch spot.',
    items: ['Special Smoky Jollof', 'Pepper Chicken'],
    reply: {
      text: 'Thank you so much Folashade! Our head chef takes deep pride in our authentic firewood smoking technique. We look forward to cooking your next lunch feast!',
      when: 'Yesterday, 4:10 PM',
    },
    hasPhoto: true,
  },
  {
    id: 'r2',
    name: 'Tunde Oladipo',
    rating: 4,
    when: '2 days ago',
    verified: 'Verified Order',
    order: '#OYO-9742',
    text: "Amala and Gbegiri was delicious and hot on arrival. The goat meat was very soft. Only reason for 4 stars is that I requested extra stew on the side but didn't get enough. Please include more pepper stew next time!",
  },
  {
    id: 'r3',
    name: 'Grace Eze',
    rating: 5,
    when: '3 days ago',
    verified: 'Verified OYO Delivery Order',
    order: '#OYO-9720',
    text: 'Best suya in Ibadan, no contest. The yaji was perfectly balanced and the onions were fresh.',
    items: ['Special Grilled Beef Suya'],
  },
  {
    id: 'r4',
    name: 'Segun Ajayi',
    rating: 3,
    when: '4 days ago',
    verified: 'Verified Order',
    order: '#OYO-9701',
    text: 'Food was tasty but delivery took about 50 minutes and the rice was a bit cold on arrival.',
  },
]

export const ratingBreakdown = [
  { stars: 5, count: 395 },
  { stars: 4, count: 58 },
  { stars: 3, count: 19 },
  { stars: 2, count: 7 },
  { stars: 1, count: 3 },
]

export interface Promotion {
  id: string
  name: string
  code: string
  description: string
  redeemed: number
  cap?: number
  unit: string
  period: string
  eligible: string
  footer: string
  status: 'active' | 'scheduled' | 'expired' | 'draft'
  bar: 'brand' | 'ok'
}

export const initialPromotions: Promotion[] = [
  {
    id: 'p1',
    name: 'Weekend Party Jollof Special',
    code: 'JOLLOF15',
    description: '15% discount on all Smoky Jollof rice combo platters with minimum order of ₦4,000.',
    redeemed: 142,
    cap: 200,
    unit: 'orders',
    period: '01 Nov - 15 Nov 2026 (3 days left)',
    eligible: 'Eligible: Rice & Pastas Category',
    footer: 'Generated ₦680k sales',
    status: 'active',
    bar: 'brand',
  },
  {
    id: 'p2',
    name: 'Free Delivery Above ₦8,000',
    code: 'FREEDEL8K',
    description: 'Zero rider delivery fee for large family or office orders anywhere within Bodija & UI.',
    redeemed: 88,
    unit: 'Orders',
    period: 'Ongoing Month-long Special',
    eligible: 'Avg Order Size: ₦11,400 (High cart value)',
    footer: 'Generated ₦962k sales',
    status: 'active',
    bar: 'ok',
  },
  {
    id: 'p3',
    name: 'Complimentary Chilled Zobo',
    code: 'FREEZOBO',
    description: 'Receive 1× 500ml ice-chilled organic Zobo drink with any Amala Abula Feast order.',
    redeemed: 118,
    cap: 140,
    unit: 'Bottles',
    period: 'Ends 18 Nov 2026',
    eligible: 'Dish: Amala with Gbegiri & Ewedu',
    footer: '4.9 Star Rating Score',
    status: 'active',
    bar: 'brand',
  },
  {
    id: 'p4',
    name: 'December Suya Feast',
    code: 'SUYA20',
    description: '20% off all Grills & Suya orders above ₦3,500.',
    redeemed: 0,
    cap: 150,
    unit: 'orders',
    period: '01 Dec - 31 Dec 2026',
    eligible: 'Eligible: Grills & Suya',
    footer: 'Starts in 7 days',
    status: 'scheduled',
    bar: 'brand',
  },
  ...Array.from({ length: 8 }, (_, i): Promotion => ({
    id: 'px' + i,
    name: ['Independence Day Jollof', 'Back to School Combo', 'Rainy Day Amala', 'Office Lunch Deal', 'Sallah Special', 'Mid-Year Suya', 'Workers Day Treat', 'Easter Feast'][i],
    code: ['OCT1', 'SCHOOL10', 'RAINY', 'LUNCH500', 'SALLAH', 'MIDSUYA', 'MAY1', 'EASTER'][i],
    description: 'Concluded campaign.',
    redeemed: 60 + i * 13,
    unit: 'orders',
    period: 'Concluded',
    eligible: 'Entire Store Menu',
    footer: 'Generated ₦' + (210 + i * 35) + 'k sales',
    status: 'expired',
    bar: 'brand',
  })),
]

export const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export const initialSchedule = [
  { open: '08:00', close: '22:00', enabled: true },
  { open: '08:00', close: '22:00', enabled: true },
  { open: '08:00', close: '22:00', enabled: true },
  { open: '08:00', close: '22:00', enabled: true },
  { open: '08:00', close: '23:30', enabled: true },
  { open: '09:00', close: '23:30', enabled: true },
  { open: '10:00', close: '21:00', enabled: true },
]

export const nigerianStates: Record<string, string[]> = {
  Oyo: ['Ibadan North', 'Ibadan North-East', 'Ibadan North-West', 'Ibadan South-East', 'Ibadan South-West', 'Akinyele', 'Egbeda', 'Ido', 'Lagelu', 'Oluyole', 'Ogbomosho North', 'Oyo East'],
  Lagos: ['Ikeja', 'Eti-Osa', 'Lagos Island', 'Lagos Mainland', 'Surulere', 'Alimosho', 'Kosofe', 'Ikorodu'],
  'FCT Abuja': ['Abuja Municipal', 'Bwari', 'Gwagwalada', 'Kuje', 'Kwali', 'Abaji'],
  Ogun: ['Abeokuta North', 'Abeokuta South', 'Ijebu Ode', 'Sagamu', 'Ado-Odo/Ota'],
  Osun: ['Osogbo', 'Ife Central', 'Ilesa East', 'Ede North'],
}

export const banks = [
  'Guaranty Trust Bank (GTBank)',
  'Access Bank',
  'First Bank of Nigeria',
  'United Bank for Africa (UBA)',
  'Zenith Bank',
  'Wema Bank',
  'Opay',
  'Moniepoint MFB',
  'Kuda Bank',
]

export const restaurantTypes = ['Restaurant', 'Buka / Local Kitchen', 'Fast Food', 'Cafe & Bakery', 'Grill & Suya Spot', 'Cloud / Home Kitchen']

export const orderTotal = (o: Order) => o.items.reduce((s, i) => s + i.price, 0)
