// Mock Initial Dataset for Hotel Booking Platform Admin Panel

export const INITIAL_OWNERS = [
  {
    id: 'OWN-101',
    name: 'Rajesh Singhania',
    email: 'rajesh@grandhorizon.com',
    phone: '+91 98201 44521',
    businessName: 'Horizon Hospitality Ltd.',
    businessRegNo: 'U55101MH2018PTC309112',
    panNo: 'AAACH8921K',
    gstin: '27AAACH8921K1ZX',
    bankAccount: 'HDFC Bank - 50100492819283 (IFSC: HDFC0000060)',
    address: 'Bandra West, Mumbai, Maharashtra',
    verificationStatus: 'verified',
    submittedAt: '2026-06-10T10:30:00Z',
    verifiedAt: '2026-06-12T14:20:00Z',
    hotelsCount: 2,
    documents: [
      { type: 'GST Certificate', number: '27AAACH8921K1ZX', verified: true },
      { type: 'PAN Card', number: 'AAACH8921K', verified: true },
      { type: 'Hotel Trade License', number: 'MCGM/TL/2026/8941', verified: true }
    ]
  },
  {
    id: 'OWN-102',
    name: 'Vikramaditya Rathore',
    email: 'vikram@palaceheritage.in',
    phone: '+91 94140 88219',
    businessName: 'Rathore Heritage Hotels Pvt Ltd',
    businessRegNo: 'U55102RJ2016PTC049281',
    panNo: 'AABCR4412M',
    gstin: '08AABCR4412M1ZY',
    bankAccount: 'ICICI Bank - 002105018921 (IFSC: ICIC0000021)',
    address: 'Amer Road, Jaipur, Rajasthan',
    verificationStatus: 'verified',
    submittedAt: '2026-06-15T11:00:00Z',
    verifiedAt: '2026-06-16T16:45:00Z',
    hotelsCount: 1,
    documents: [
      { type: 'GST Certificate', number: '08AABCR4412M1ZY', verified: true },
      { type: 'Heritage Tourism License', number: 'RAJ-TOUR-2024-11', verified: true }
    ]
  },
  {
    id: 'OWN-103',
    name: 'Anthony D\'Souza',
    email: 'anthony@azurebaygoa.com',
    phone: '+91 98221 77391',
    businessName: 'Goa Coastal Resorts LLP',
    businessRegNo: 'AAG-9912-GA',
    panNo: 'AACCG1192P',
    gstin: '30AACCG1192P1ZW',
    bankAccount: 'Axis Bank - 91802004819281 (IFSC: UTIB0000182)',
    address: 'Calangute Beach Road, North Goa',
    verificationStatus: 'verified',
    submittedAt: '2026-07-01T09:15:00Z',
    verifiedAt: '2026-07-02T12:00:00Z',
    hotelsCount: 1,
    documents: [
      { type: 'GST Certificate', number: '30AACCG1192P1ZW', verified: true },
      { type: 'FSSAI License', number: '10020032001928', verified: true }
    ]
  },
  {
    id: 'OWN-104',
    name: 'Sunil Kumar Mittal',
    email: 'sunil@theclaridgesdelhi.com',
    phone: '+91 98110 33928',
    businessName: 'Capital Luxury Stays LLP',
    businessRegNo: 'DL-LLP-2021-9921',
    panNo: 'AAPPM8832L',
    gstin: '07AAPPM8832L1Z9',
    bankAccount: 'State Bank of India - 39281928192 (IFSC: SBIN0000691)',
    address: 'Connaught Place, New Delhi',
    verificationStatus: 'pending',
    submittedAt: '2026-08-20T14:40:00Z',
    verifiedAt: null,
    hotelsCount: 1,
    documents: [
      { type: 'GST Certificate', number: '07AAPPM8832L1Z9', verified: false },
      { type: 'Aadhaar / ID Card', number: 'XXXX-XXXX-8921', verified: false },
      { type: 'Fire Safety NOC', number: 'DFS/NOC/2026/092', verified: false }
    ]
  },
  {
    id: 'OWN-105',
    name: 'Pooja Hegde',
    email: 'pooja@siliconvalleybliss.com',
    phone: '+91 97401 22891',
    businessName: 'Deccan Suites & Tech Stays',
    businessRegNo: 'KA-2023-88219',
    panNo: 'AAAPH9021K',
    gstin: '29AAAPH9021K1ZU',
    bankAccount: 'Kotak Mahindra Bank - 7819281920 (IFSC: KKBK0000421)',
    address: 'Indiranagar, Bengaluru, Karnataka',
    verificationStatus: 'pending',
    submittedAt: '2026-08-22T16:10:00Z',
    verifiedAt: null,
    hotelsCount: 1,
    documents: [
      { type: 'GST Certificate', number: '29AAAPH9021K1ZU', verified: false },
      { type: 'Trade License', number: 'BBMP/2026/7781', verified: false }
    ]
  },
  {
    id: 'OWN-106',
    name: 'Karan Mehra',
    email: 'karan@himalayanheights.com',
    phone: '+91 94180 55192',
    businessName: 'Pine Crest Resorts Pvt Ltd',
    businessRegNo: 'HP-2020-00918',
    panNo: 'AABCK7721N',
    gstin: '02AABCK7721N1ZQ',
    bankAccount: 'Punjab National Bank - 192800210009 (IFSC: PUNB0019200)',
    address: 'Mall Road, Shimla, Himachal Pradesh',
    verificationStatus: 'rejected',
    rejectionReason: 'Invalid property ownership document & expired fire safety clearance.',
    submittedAt: '2026-08-10T10:00:00Z',
    verifiedAt: null,
    hotelsCount: 1,
    documents: [
      { type: 'Expired Fire NOC', number: 'HP-FIRE-2023', verified: false }
    ]
  }
];

export const INITIAL_HOTELS = [
  {
    id: 'HTL-001',
    name: 'The Grand Horizon Hotel & Suites',
    ownerId: 'OWN-101',
    ownerName: 'Rajesh Singhania',
    city: 'Mumbai',
    state: 'Maharashtra',
    address: 'Bandra Kurla Complex, Bandra East, Mumbai - 400051',
    rating: 4.8,
    reviewsCount: 342,
    starCategory: 5,
    status: 'active',
    featured: true,
    coverImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80'
    ],
    pricePerNight: 8500,
    roomsCount: 45,
    availableRooms: 12,
    amenities: ['Free WiFi', 'Infinity Pool', 'Spa & Wellness', 'Fine Dining Restaurant', '24/7 Room Service', 'Valet Parking'],
    description: 'Ultra-luxury business and leisure hotel located in the heart of BKC Mumbai with world-class dining, skyline views, and premium suites.'
  },
  {
    id: 'HTL-002',
    name: 'Royal Heritage Palace & Spa',
    ownerId: 'OWN-102',
    ownerName: 'Vikramaditya Rathore',
    city: 'Jaipur',
    state: 'Rajasthan',
    address: 'Amer Road, Near Jal Mahal, Jaipur - 302002',
    rating: 4.9,
    reviewsCount: 520,
    starCategory: 5,
    status: 'active',
    featured: true,
    coverImage: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80'
    ],
    pricePerNight: 12000,
    roomsCount: 38,
    availableRooms: 8,
    amenities: ['Royal Courtyard', 'Ayurvedic Spa', 'Swimming Pool', 'Folk Music Evenings', 'Heritage Suites', 'Free Breakfast'],
    description: 'A 200-year-old restored Rajput palace offering authentic royal hospitality, regal courtyards, and handcrafted luxury.'
  },
  {
    id: 'HTL-003',
    name: 'Azure Bay Beach Resort & Club',
    ownerId: 'OWN-103',
    ownerName: 'Anthony D\'Souza',
    city: 'Goa',
    state: 'Goa',
    address: 'Calangute Beach Road, North Goa - 403516',
    rating: 4.7,
    reviewsCount: 289,
    starCategory: 4,
    status: 'active',
    featured: true,
    coverImage: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80'
    ],
    pricePerNight: 6500,
    roomsCount: 50,
    availableRooms: 15,
    amenities: ['Direct Beach Access', 'Beachfront Bar', 'Outdoor Pool', 'Water Sports Desk', 'Free WiFi', 'Complimentary Breakfast'],
    description: 'Vibrant beachfront paradise steps from Calangute sands with sun decks, poolside cocktails, and live Goan cuisine.'
  },
  {
    id: 'HTL-004',
    name: 'The Imperial Imperial Suites New Delhi',
    ownerId: 'OWN-104',
    ownerName: 'Sunil Kumar Mittal',
    city: 'Delhi',
    state: 'Delhi NCR',
    address: 'Janpath, Connaught Place, New Delhi - 110001',
    rating: 4.6,
    reviewsCount: 198,
    starCategory: 5,
    status: 'under_review',
    featured: false,
    coverImage: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=800&q=80'
    ],
    pricePerNight: 9200,
    roomsCount: 60,
    availableRooms: 20,
    amenities: ['Business Center', 'Metro Proximity', 'Gym & Fitness', 'Multi-Cuisine Buffet', 'Airport Shuttle'],
    description: 'Iconic heritage hotel in central Delhi blending Victorian colonial charm with modern 5-star executive amenities.'
  },
  {
    id: 'HTL-005',
    name: 'Silicon Valley Tech Suites & Loft',
    ownerId: 'OWN-105',
    ownerName: 'Pooja Hegde',
    city: 'Bengaluru',
    state: 'Karnataka',
    address: '100 Feet Road, Indiranagar, Bengaluru - 560038',
    rating: 4.5,
    reviewsCount: 145,
    starCategory: 4,
    status: 'under_review',
    featured: false,
    coverImage: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=800&q=80'
    ],
    pricePerNight: 5400,
    roomsCount: 30,
    availableRooms: 10,
    amenities: ['High-speed 1Gbps Fiber', 'Co-working Pods', 'Smart Rooms', 'Rooftop Cafe', '24/7 Gym'],
    description: 'Designed for digital nomads and tech executives in vibrant Indiranagar with ergonomic workstations and smart IoT controls.'
  },
  {
    id: 'HTL-006',
    name: 'Himalayan Heights Pine Resort',
    ownerId: 'OWN-106',
    ownerName: 'Karan Mehra',
    city: 'Shimla',
    state: 'Himachal Pradesh',
    address: 'Near Ridge, The Mall, Shimla - 171001',
    rating: 4.2,
    reviewsCount: 94,
    starCategory: 3,
    status: 'suspended',
    featured: false,
    coverImage: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80'
    ],
    pricePerNight: 4200,
    roomsCount: 22,
    availableRooms: 0,
    amenities: ['Snow Peak Views', 'Fireplace Lounge', 'Heated Blankets', 'Mountain Trekking Guides'],
    description: 'Cozy boutique pine stay with panoramic views of snow-capped Shivalik ranges, currently suspended pending documentation.'
  }
];

export const INITIAL_BOOKINGS = [
  {
    bookingId: 'HTL-94021',
    hotelId: 'HTL-001',
    hotelName: 'The Grand Horizon Hotel & Suites',
    customerName: 'Aarav Sharma',
    customerEmail: 'aarav.sharma@gmail.com',
    customerPhone: '+91 98200 11928',
    roomType: 'Executive Deluxe Suite',
    guests: 2,
    rooms: 1,
    checkInDate: '2026-08-25',
    checkOutDate: '2026-08-28',
    nights: 3,
    baseAmount: 25500,
    taxAmount: 3060,
    totalAmount: 28560,
    commissionRate: 15,
    commissionAmount: 4284,
    ownerPayoutAmount: 24276,
    paymentStatus: 'successful',
    paymentMethod: 'UPI (Google Pay)',
    transactionId: 'TXN-99482910',
    bookingStatus: 'confirmed',
    createdAt: '2026-08-23T10:15:00Z'
  },
  {
    bookingId: 'HTL-94022',
    hotelId: 'HTL-002',
    hotelName: 'Royal Heritage Palace & Spa',
    customerName: 'Meera Iyer',
    customerEmail: 'meera.iyer@outlook.com',
    customerPhone: '+91 99401 88372',
    roomType: 'Maharaja Royal Suite',
    guests: 2,
    rooms: 1,
    checkInDate: '2026-08-22',
    checkOutDate: '2026-08-24',
    nights: 2,
    baseAmount: 24000,
    taxAmount: 2880,
    totalAmount: 26880,
    commissionRate: 15,
    commissionAmount: 4032,
    ownerPayoutAmount: 22848,
    paymentStatus: 'successful',
    paymentMethod: 'Credit Card (HDFC Visa)',
    transactionId: 'TXN-88492011',
    bookingStatus: 'checked-in',
    createdAt: '2026-08-21T14:30:00Z'
  },
  {
    bookingId: 'HTL-94023',
    hotelId: 'HTL-003',
    hotelName: 'Azure Bay Beach Resort & Club',
    customerName: 'Rohan Deshmukh',
    customerEmail: 'rohan.d@gmail.com',
    customerPhone: '+91 98210 99481',
    roomType: 'Ocean Breeze Villa',
    guests: 4,
    rooms: 2,
    checkInDate: '2026-08-18',
    checkOutDate: '2026-08-21',
    nights: 3,
    baseAmount: 39000,
    taxAmount: 4680,
    totalAmount: 43680,
    commissionRate: 15,
    commissionAmount: 6552,
    ownerPayoutAmount: 37128,
    paymentStatus: 'successful',
    paymentMethod: 'Net Banking (ICICI)',
    transactionId: 'TXN-77392019',
    bookingStatus: 'checked-out',
    createdAt: '2026-08-16T12:00:00Z'
  },
  {
    bookingId: 'HTL-94024',
    hotelId: 'HTL-001',
    hotelName: 'The Grand Horizon Hotel & Suites',
    customerName: 'Ananya Verma',
    customerEmail: 'ananya.v@yahoo.com',
    customerPhone: '+91 97110 44821',
    roomType: 'Club King Room',
    guests: 1,
    rooms: 1,
    checkInDate: '2026-08-26',
    checkOutDate: '2026-08-27',
    nights: 1,
    baseAmount: 8500,
    taxAmount: 1020,
    totalAmount: 9520,
    commissionRate: 15,
    commissionAmount: 1428,
    ownerPayoutAmount: 8092,
    paymentStatus: 'refunded',
    paymentMethod: 'UPI (PhonePe)',
    transactionId: 'TXN-66492018',
    bookingStatus: 'cancelled',
    cancellationReason: 'Flight cancelled due to heavy monsoon rains',
    createdAt: '2026-08-22T08:20:00Z'
  },
  {
    bookingId: 'HTL-94025',
    hotelId: 'HTL-002',
    hotelName: 'Royal Heritage Palace & Spa',
    customerName: 'Siddharth Roy',
    customerEmail: 'siddharth@royholdings.com',
    customerPhone: '+91 98300 77192',
    roomType: 'Heritage Courtyard Room',
    guests: 2,
    rooms: 1,
    checkInDate: '2026-08-29',
    checkOutDate: '2026-09-02',
    nights: 4,
    baseAmount: 48000,
    taxAmount: 5760,
    totalAmount: 53760,
    commissionRate: 15,
    commissionAmount: 8064,
    ownerPayoutAmount: 45696,
    paymentStatus: 'successful',
    paymentMethod: 'Credit Card (Amex)',
    transactionId: 'TXN-55482910',
    bookingStatus: 'confirmed',
    createdAt: '2026-08-23T15:10:00Z'
  },
  {
    bookingId: 'HTL-94026',
    hotelId: 'HTL-003',
    hotelName: 'Azure Bay Beach Resort & Club',
    customerName: 'Priya Nambiar',
    customerEmail: 'priya.nambiar@gmail.com',
    customerPhone: '+91 94470 11928',
    roomType: 'Beachfront Cottage',
    guests: 3,
    rooms: 1,
    checkInDate: '2026-08-27',
    checkOutDate: '2026-08-30',
    nights: 3,
    baseAmount: 19500,
    taxAmount: 2340,
    totalAmount: 21840,
    commissionRate: 15,
    commissionAmount: 3276,
    ownerPayoutAmount: 18564,
    paymentStatus: 'pending',
    paymentMethod: 'UPI (Paytm)',
    transactionId: 'TXN-44392019',
    bookingStatus: 'confirmed',
    createdAt: '2026-08-23T17:45:00Z'
  },
  {
    bookingId: 'HTL-94027',
    hotelId: 'HTL-001',
    hotelName: 'The Grand Horizon Hotel & Suites',
    customerName: 'Devendra Patel',
    customerEmail: 'devendra.patel@gmail.com',
    customerPhone: '+91 98250 88291',
    roomType: 'Presidential Suite',
    guests: 2,
    rooms: 1,
    checkInDate: '2026-08-24',
    checkOutDate: '2026-08-26',
    nights: 2,
    baseAmount: 32000,
    taxAmount: 3840,
    totalAmount: 35840,
    commissionRate: 15,
    commissionAmount: 5376,
    ownerPayoutAmount: 30464,
    paymentStatus: 'successful',
    paymentMethod: 'Debit Card (SBI)',
    transactionId: 'TXN-33492018',
    bookingStatus: 'confirmed',
    createdAt: '2026-08-23T11:00:00Z'
  }
];

export const INITIAL_REFUNDS = [
  {
    refundId: 'REF-8801',
    bookingId: 'HTL-94024',
    customerName: 'Ananya Verma',
    customerEmail: 'ananya.v@yahoo.com',
    hotelName: 'The Grand Horizon Hotel & Suites',
    bookingAmount: 9520,
    cancellationFee: 952,
    refundAmount: 8568,
    reason: 'Flight cancelled due to heavy monsoon rains',
    status: 'approved',
    requestedAt: '2026-08-22T09:00:00Z',
    processedAt: '2026-08-22T14:15:00Z',
    adminNotes: '100% refund processed less 10% standard processing fee under policy.'
  },
  {
    refundId: 'REF-8802',
    bookingId: 'HTL-94019',
    customerName: 'Kunal Kapoor',
    customerEmail: 'kunal.kapoor@gmail.com',
    hotelName: 'Azure Bay Beach Resort & Club',
    bookingAmount: 13000,
    cancellationFee: 2600,
    refundAmount: 10400,
    reason: 'Medical emergency in family, unable to travel to Goa',
    status: 'pending',
    requestedAt: '2026-08-23T08:30:00Z',
    processedAt: null,
    adminNotes: null
  },
  {
    refundId: 'REF-8803',
    bookingId: 'HTL-94015',
    customerName: 'Gaurav Mukherjee',
    customerEmail: 'gmukherjee@techcorp.in',
    hotelName: 'Royal Heritage Palace & Spa',
    bookingAmount: 26880,
    cancellationFee: 0,
    refundAmount: 0,
    reason: 'Requested refund 2 hours before check-in time after non-refundable window',
    status: 'rejected',
    requestedAt: '2026-08-20T16:00:00Z',
    processedAt: '2026-08-21T09:30:00Z',
    adminNotes: 'Rejected as per Clause 6.2 - Non-refundable booking window breached (< 24h).'
  }
];

export const INITIAL_TICKETS = [
  {
    ticketId: 'TCK-501',
    customerName: 'Rohan Deshmukh',
    customerEmail: 'rohan.d@gmail.com',
    bookingId: 'HTL-94023',
    category: 'Booking & Room Allocation',
    priority: 'medium',
    subject: 'Request for early check-in at Azure Bay Resort',
    status: 'resolved',
    createdAt: '2026-08-17T10:00:00Z',
    messages: [
      { sender: 'customer', text: 'Hi, our flight reaches Dabolim at 9 AM. Can we get early check-in at Azure Bay?', time: '2026-08-17 10:00 AM' },
      { sender: 'admin', text: 'Hello Rohan, we coordinated with Anthony D\'Souza (Hotel Owner). Room is ready and early check-in is granted complimentary!', time: '2026-08-17 11:30 AM' }
    ]
  },
  {
    ticketId: 'TCK-502',
    customerName: 'Kunal Kapoor',
    customerEmail: 'kunal.kapoor@gmail.com',
    bookingId: 'HTL-94019',
    category: 'Cancellation & Refund',
    priority: 'high',
    subject: 'Urgent: Refund status for booking HTL-94019',
    status: 'open',
    createdAt: '2026-08-23T08:45:00Z',
    messages: [
      { sender: 'customer', text: 'I submitted cancellation request REF-8802 this morning. When can I expect credit to my bank?', time: '2026-08-23 08:45 AM' }
    ]
  },
  {
    ticketId: 'TCK-503',
    customerName: 'Meera Iyer',
    customerEmail: 'meera.iyer@outlook.com',
    bookingId: 'HTL-94022',
    category: 'Hotel Service Quality',
    priority: 'low',
    subject: 'Compliment: Exceptional hospitality at Royal Heritage Palace',
    status: 'resolved',
    createdAt: '2026-08-22T20:10:00Z',
    messages: [
      { sender: 'customer', text: 'Just wanted to share that the folk dance evening organized by Mr. Vikramaditya was breathtaking!', time: '2026-08-22 08:10 PM' },
      { sender: 'admin', text: 'Thank you Meera! We have passed your delightful feedback to the hotel management.', time: '2026-08-23 09:00 AM' }
    ]
  },
  {
    ticketId: 'TCK-504',
    customerName: 'Amit Saxena',
    customerEmail: 'amit.saxena@rediffmail.com',
    bookingId: 'HTL-94012',
    category: 'Payment / Invoice',
    priority: 'medium',
    subject: 'Need GST Invoice with corporate tax ID',
    status: 'in_progress',
    createdAt: '2026-08-23T14:20:00Z',
    messages: [
      { sender: 'customer', text: 'Please send tax invoice with GSTIN: 27AABCT9981P1ZV for my stay last week.', time: '2026-08-23 02:20 PM' }
    ]
  }
];

export const INITIAL_DAILY_INCOME = [
  { date: '2026-08-17', bookingsCount: 14, grossAmount: 184500, commissionEarned: 27675, ownerPayout: 156825, refunds: 0 },
  { date: '2026-08-18', bookingsCount: 18, grossAmount: 242000, commissionEarned: 36300, ownerPayout: 205700, refunds: 8500 },
  { date: '2026-08-19', bookingsCount: 16, grossAmount: 210000, commissionEarned: 31500, ownerPayout: 178500, refunds: 0 },
  { date: '2026-08-20', bookingsCount: 22, grossAmount: 318000, commissionEarned: 47700, ownerPayout: 270300, refunds: 9520 },
  { date: '2026-08-21', bookingsCount: 25, grossAmount: 365000, commissionEarned: 54750, ownerPayout: 310250, refunds: 0 },
  { date: '2026-08-22', bookingsCount: 29, grossAmount: 425000, commissionEarned: 63750, ownerPayout: 361250, refunds: 8568 },
  { date: '2026-08-23', bookingsCount: 31, grossAmount: 489500, commissionEarned: 73425, ownerPayout: 416075, refunds: 0 }
];

export const INITIAL_MONTHLY_INCOME = [
  { month: 'Mar 2026', bookingsCount: 320, grossAmount: 4200000, commissionEarned: 630000, ownerPayout: 3570000, refunds: 45000 },
  { month: 'Apr 2026', bookingsCount: 390, grossAmount: 5150000, commissionEarned: 772500, ownerPayout: 4377500, refunds: 52000 },
  { month: 'May 2026', bookingsCount: 480, grossAmount: 6420000, commissionEarned: 963000, ownerPayout: 5457000, refunds: 68000 },
  { month: 'Jun 2026', bookingsCount: 410, grossAmount: 5380000, commissionEarned: 807000, ownerPayout: 4573000, refunds: 39000 },
  { month: 'Jul 2026', bookingsCount: 450, grossAmount: 5920000, commissionEarned: 888000, ownerPayout: 5032000, refunds: 42000 },
  { month: 'Aug 2026 (MTD)', bookingsCount: 520, grossAmount: 7100000, commissionEarned: 1065000, ownerPayout: 6035000, refunds: 26600 }
];

export const INITIAL_SETTINGS = {
  platformCommissionRate: 15, // Standard %
  currency: 'INR',
  currencySymbol: '₹',
  appName: 'HotelHub Global Admin',
  appMode: 'live', // 'live' or 'maintenance'
  paymentGatewayMode: 'production', // 'test' or 'production'
  autoApproveBookings: true,
  cancellationWindowHours: 24,
  standardCancellationFeePct: 10,
  supportEmail: 'support@hotelhub.com',
  supportPhone: '+91 1800 200 8899'
};
