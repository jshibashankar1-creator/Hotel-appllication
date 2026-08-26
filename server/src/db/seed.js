import bcrypt from 'bcryptjs';
import { db } from './database.js';

export async function seedDatabase() {
  console.log('Seeding database with realistic commercial hospitality data...');

  const passwordHash = await bcrypt.hash('Password@123', 10);
  const adminPasswordHash = await bcrypt.hash('Admin@123456', 10);
  const hotelAdminPasswordHash = await bcrypt.hash('HotelAdmin@123456', 10);

  db.transaction((data) => {
    // 1. Users with Admin Hierarchy
    data.users = [
      {
        id: 'USR-SUPER-ADMIN',
        name: 'Super Administrator',
        email: 'admin@hotelhub.com',
        password: adminPasswordHash,
        role: 'super_admin',
        status: 'active',
        permissions: [
          'dashboard.view', 'hotels.view', 'hotels.verify', 'hotels.suspend',
          'owners.view', 'owners.verify', 'rooms.view', 'rooms.manage',
          'availability.view', 'availability.manage', 'bookings.view', 'bookings.manage',
          'payments.view', 'payments.manage', 'refunds.view', 'refunds.manage',
          'commission.view', 'commission.manage', 'customers.view',
          'support.view', 'support.manage', 'reports.view', 'reports.export',
          'admins.view', 'admins.create', 'admins.edit', 'admins.delete',
          'settings.view', 'settings.manage'
        ],
        createdBy: 'system',
        phone: '+91 98000 00001',
        lastLoginAt: new Date().toISOString(),
        created_at: '2026-01-01T00:00:00Z'
      },
      {
        id: 'USR-ADMIN-GEN',
        name: 'Operations Manager',
        email: 'manager@hotelhub.com',
        password: adminPasswordHash,
        role: 'admin',
        status: 'active',
        permissions: [
          'dashboard.view', 'hotels.view', 'hotels.verify', 'owners.view', 'owners.verify',
          'rooms.view', 'rooms.manage', 'availability.view', 'bookings.view', 'bookings.manage',
          'customers.view', 'support.view', 'support.manage', 'reports.view', 'reports.export'
        ],
        createdBy: 'USR-SUPER-ADMIN',
        phone: '+91 98000 00002',
        lastLoginAt: null,
        created_at: '2026-01-05T00:00:00Z'
      },
      {
        id: 'USR-SUPPORT-ADMIN',
        name: 'Support Executive',
        email: 'support.admin@hotelhub.com',
        password: adminPasswordHash,
        role: 'support_admin',
        status: 'active',
        permissions: ['dashboard.view', 'support.view', 'support.manage', 'bookings.view', 'customers.view', 'hotels.view'],
        createdBy: 'USR-SUPER-ADMIN',
        phone: '+91 98000 00003',
        lastLoginAt: null,
        created_at: '2026-01-10T00:00:00Z'
      },
      {
        id: 'USR-FINANCE-ADMIN',
        name: 'Finance Controller',
        email: 'finance.admin@hotelhub.com',
        password: adminPasswordHash,
        role: 'finance_admin',
        status: 'active',
        permissions: ['dashboard.view', 'payments.view', 'payments.manage', 'refunds.view', 'refunds.manage', 'commission.view', 'commission.manage', 'reports.view', 'reports.export'],
        createdBy: 'USR-SUPER-ADMIN',
        phone: '+91 98000 00004',
        lastLoginAt: null,
        created_at: '2026-01-15T00:00:00Z'
      },
      {
        id: 'USR-HOTEL-ADMIN-MAIN',
        name: 'Grand Horizon Admin',
        email: 'hoteladmin@hotelhub.com',
        password: hotelAdminPasswordHash,
        role: 'hotel_admin',
        hotel_id: 'HTL-001',
        status: 'active',
        permissions: ['dashboard.view', 'hotels.view', 'rooms.view', 'rooms.manage', 'availability.view', 'availability.manage', 'bookings.view'],
        createdBy: 'USR-SUPER-ADMIN',
        phone: '+91 98000 00005',
        lastLoginAt: null,
        created_at: '2026-01-20T00:00:00Z'
      },
      {
        id: 'USR-HOTEL-ADMIN-A',
        name: 'Grand Horizon Admin A',
        email: 'hoteladminA@hotelhub.com',
        password: hotelAdminPasswordHash,
        role: 'hotel_admin',
        hotel_id: 'HTL-001',
        status: 'active',
        permissions: ['dashboard.view', 'hotels.view', 'rooms.view', 'rooms.manage', 'availability.view', 'availability.manage', 'bookings.view'],
        createdBy: 'USR-SUPER-ADMIN',
        phone: '+91 98000 00006',
        lastLoginAt: null,
        created_at: '2026-01-22T00:00:00Z'
      },
      {
        id: 'USR-HOTEL-ADMIN-B',
        name: 'Royal Heritage Admin B',
        email: 'hoteladminB@hotelhub.com',
        password: hotelAdminPasswordHash,
        role: 'hotel_admin',
        hotel_id: 'HTL-002',
        status: 'active',
        permissions: ['dashboard.view', 'hotels.view', 'rooms.view', 'rooms.manage', 'availability.view', 'availability.manage', 'bookings.view'],
        createdBy: 'USR-SUPER-ADMIN',
        phone: '+91 98000 00007',
        lastLoginAt: null,
        created_at: '2026-01-25T00:00:00Z'
      },
      {
        id: 'USR-HOTEL-ADMIN',
        name: 'Hotel Operations Lead',
        email: 'hotel.admin@hotelhub.com',
        password: adminPasswordHash,
        role: 'hotel_admin',
        hotel_id: 'HTL-001',
        status: 'active',
        permissions: ['dashboard.view', 'hotels.view', 'rooms.view', 'rooms.manage', 'availability.view', 'availability.manage', 'bookings.view'],
        createdBy: 'USR-SUPER-ADMIN',
        phone: '+91 98000 00008',
        lastLoginAt: null,
        created_at: '2026-01-20T00:00:00Z'
      },
      {
        id: 'USR-OWNER-1',
        name: 'Rajesh Singhania',
        email: 'rajesh@grandhorizon.com',
        password: passwordHash,
        role: 'owner',
        phone: '+91 98201 44521',
        created_at: '2026-02-10T10:00:00Z'
      },
      {
        id: 'USR-OWNER-2',
        name: 'Vikramaditya Rathore',
        email: 'vikram@palaceheritage.in',
        password: passwordHash,
        role: 'owner',
        phone: '+91 94140 88219',
        created_at: '2026-03-15T11:00:00Z'
      },
      {
        id: 'USR-OWNER-3',
        name: 'Anthony D\'Souza',
        email: 'anthony@azurebaygoa.com',
        password: passwordHash,
        role: 'owner',
        phone: '+91 98221 77391',
        created_at: '2026-04-01T09:00:00Z'
      },
      {
        id: 'USR-OWNER-4',
        name: 'Sunil Kumar Mittal',
        email: 'sunil@theclaridgesdelhi.com',
        password: passwordHash,
        role: 'owner',
        phone: '+91 98110 33928',
        created_at: '2026-08-20T14:40:00Z'
      },
      {
        id: 'USR-CUST-1',
        name: 'Aarav Sharma',
        email: 'aarav.sharma@gmail.com',
        password: passwordHash,
        role: 'customer',
        phone: '+91 98200 11928',
        created_at: '2026-05-10T08:00:00Z'
      },
      {
        id: 'USR-CUST-2',
        name: 'Meera Iyer',
        email: 'meera.iyer@outlook.com',
        password: passwordHash,
        role: 'customer',
        phone: '+91 99401 88372',
        created_at: '2026-05-12T10:30:00Z'
      },
      {
        id: 'USR-CUST-3',
        name: 'Rohan Deshmukh',
        email: 'rohan.d@gmail.com',
        password: passwordHash,
        role: 'customer',
        phone: '+91 98210 99481',
        created_at: '2026-05-15T12:00:00Z'
      },
      {
        id: 'USR-CUST-4',
        name: 'Ananya Verma',
        email: 'ananya.v@yahoo.com',
        password: passwordHash,
        role: 'customer',
        phone: '+91 97110 44821',
        created_at: '2026-06-01T14:00:00Z'
      }
    ];

    // 2. Owner Profiles (KYC)
    data.owner_profiles = [
      {
        user_id: 'USR-OWNER-1',
        business_name: 'Horizon Hospitality Ltd.',
        business_reg_no: 'U55101MH2018PTC309112',
        pan_no: 'AAACH8921K',
        gstin: '27AAACH8921K1ZX',
        bank_account: 'HDFC Bank - 50100492819283 (IFSC: HDFC0000060)',
        address: 'Bandra West, Mumbai, Maharashtra',
        kyc_status: 'verified',
        rejection_reason: null,
        submitted_at: '2026-02-10T10:30:00Z',
        verified_at: '2026-02-12T14:20:00Z'
      },
      {
        user_id: 'USR-OWNER-2',
        business_name: 'Rathore Heritage Hotels Pvt Ltd',
        business_reg_no: 'U55102RJ2016PTC049281',
        pan_no: 'AABCR4412M',
        gstin: '08AABCR4412M1ZY',
        bank_account: 'ICICI Bank - 002105018921 (IFSC: ICIC0000021)',
        address: 'Amer Road, Jaipur, Rajasthan',
        kyc_status: 'verified',
        rejection_reason: null,
        submitted_at: '2026-03-15T11:00:00Z',
        verified_at: '2026-03-16T16:45:00Z'
      },
      {
        user_id: 'USR-OWNER-3',
        business_name: 'Goa Coastal Resorts LLP',
        business_reg_no: 'AAG-9912-GA',
        pan_no: 'AACCG1192P',
        gstin: '30AACCG1192P1ZW',
        bank_account: 'Axis Bank - 91802004819281 (IFSC: UTIB0000182)',
        address: 'Calangute Beach Road, North Goa',
        kyc_status: 'verified',
        rejection_reason: null,
        submitted_at: '2026-04-01T09:15:00Z',
        verified_at: '2026-04-02T12:00:00Z'
      },
      {
        user_id: 'USR-OWNER-4',
        business_name: 'Capital Luxury Stays LLP',
        business_reg_no: 'DL-LLP-2021-9921',
        pan_no: 'AAPPM8832L',
        gstin: '07AAPPM8832L1Z9',
        bank_account: 'State Bank of India - 39281928192 (IFSC: SBIN0000691)',
        address: 'Connaught Place, New Delhi',
        kyc_status: 'pending',
        rejection_reason: null,
        submitted_at: '2026-08-20T14:40:00Z',
        verified_at: null
      }
    ];

    // 3. Hotels (Primary: New Digha, Supported: Old Digha, Region: Digha, West Bengal)
    data.hotels = [
      {
        id: 'HTL-001',
        owner_id: 'USR-OWNER-1',
        owner_name: 'Rajesh Singhania',
        name: 'Hotel Sea Hawk New Digha',
        hotel_type: 'Luxury Beach Resort',
        description: 'Premier luxury beachfront resort in New Digha offering panoramic Bay of Bengal views, private balcony sea-facing suites, swimming pool, and authentic Bengali and Continental seafood dining.',
        address: 'Sea Beach Road, Near Digha Science Centre',
        area: 'New Digha Beach',
        city: 'New Digha',
        state: 'West Bengal',
        country: 'India',
        postal_code: '721463',
        rating: 4.8,
        reviews_count: 142,
        star_category: 5,
        status: 'active',
        cover_image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
        gallery: [
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80'
        ],
        amenities: ['Direct Beach Access', 'Infinity Pool', 'Ayurvedic Wellness Spa', 'Multi-Cuisine Seafood Restaurant', '24/7 Room Service', 'Valet Parking', 'Free High-speed Wi-Fi'],
        created_at: '2026-02-15T10:00:00Z'
      },
      {
        id: 'HTL-002',
        owner_id: 'USR-OWNER-2',
        owner_name: 'Vikramaditya Rathore',
        name: 'Grand Digha Luxury Resort & Spa',
        hotel_type: '5-Star Luxury Resort',
        description: 'Sprawling 5-star luxury property in New Digha near the Science Park featuring landscaped gardens, swimming pool, Ayurvedic wellness spa, and grand banquet facilities.',
        address: 'Near Marine Aquarium & Science Centre, New Digha',
        area: 'New Digha Science Park',
        city: 'New Digha',
        state: 'West Bengal',
        country: 'India',
        postal_code: '721463',
        rating: 4.9,
        reviews_count: 220,
        star_category: 5,
        status: 'active',
        cover_image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
        gallery: [
          'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80'
        ],
        amenities: ['Lush Garden', 'Spa & Wellness', 'Outdoor Swimming Pool', 'Live Bengali Folk Music', 'Complimentary Buffet Breakfast', 'Concierge Desk'],
        created_at: '2026-03-20T11:00:00Z'
      },
      {
        id: 'HTL-003',
        owner_id: 'USR-OWNER-3',
        owner_name: 'Anthony D\'Souza',
        name: 'Old Digha Heritage Beach Hotel',
        hotel_type: 'Heritage Coastal Hotel',
        description: 'Iconic heritage beachfront hotel in Old Digha with tranquil sea-facing promenades, historic colonial architecture, and fresh coastal dining.',
        address: 'Barrister Colony, Main Beach Road, Old Digha',
        area: 'Old Digha Barrister Colony',
        city: 'Old Digha',
        state: 'West Bengal',
        country: 'India',
        postal_code: '721428',
        rating: 4.7,
        reviews_count: 189,
        star_category: 4,
        status: 'active',
        cover_image: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1200&q=80',
        gallery: [
          'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80'
        ],
        amenities: ['Direct Sea Promenade Access', 'Heritage Architecture', 'Seafood Special Restaurant', 'Free Wi-Fi', 'Complimentary Breakfast'],
        created_at: '2026-04-10T09:00:00Z'
      },
      {
        id: 'HTL-004',
        owner_id: 'USR-OWNER-4',
        owner_name: 'Sunil Kumar Mittal',
        name: 'Hotel Sea Sand & Suites Old Digha',
        hotel_type: 'Boutique Beach Stay',
        description: 'Popular family boutique hotel in Old Digha located just 50 meters from the sea beach with 24/7 room service, air-conditioned executive rooms, and multi-cuisine restaurant.',
        address: 'Sea Beach Road, Near Old Digha Market',
        area: 'Old Digha Market Area',
        city: 'Old Digha',
        state: 'West Bengal',
        country: 'India',
        postal_code: '721428',
        rating: 4.6,
        reviews_count: 98,
        star_category: 4,
        status: 'active',
        cover_image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1200&q=80',
        gallery: [
          'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1200&q=80'
        ],
        amenities: ['Beach Proximity (50m)', 'AC Rooms', 'Multi-Cuisine Dining', 'Travel Desk', 'Room Service'],
        created_at: '2026-08-20T14:45:00Z'
      }
    ];

    // 4. Rooms
    data.rooms = [
      // Mumbai Hotel Rooms
      {
        id: 'RM-101',
        hotel_id: 'HTL-001',
        room_name: 'Executive Deluxe Suite',
        room_type: 'Suite',
        description: 'Spacious 450 sq.ft suite with king-size bed, skyline city view, marble bathroom, and dedicated work desk.',
        max_guests: 2,
        total_inventory: 15,
        price_per_night: 8500,
        photos: ['https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80'],
        is_active: true
      },
      {
        id: 'RM-102',
        hotel_id: 'HTL-001',
        room_name: 'Presidential Skyline Suite',
        room_type: 'Luxury Suite',
        description: 'Expansive 900 sq.ft suite with private lounge, jacuzzi, panoramic Mumbai skyline views, and butler service.',
        max_guests: 3,
        total_inventory: 5,
        price_per_night: 18000,
        photos: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80'],
        is_active: true
      },
      // Jaipur Hotel Rooms
      {
        id: 'RM-201',
        hotel_id: 'HTL-002',
        room_name: 'Heritage Courtyard Room',
        room_type: 'Deluxe Heritage',
        description: 'Traditional Rajasthani decor with antique furnishings, private jharokha balcony overlooking the palace courtyard.',
        max_guests: 2,
        total_inventory: 20,
        price_per_night: 12000,
        photos: ['https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80'],
        is_active: true
      },
      {
        id: 'RM-202',
        hotel_id: 'HTL-002',
        room_name: 'Maharaja Royal Suite',
        room_type: 'Royal Suite',
        description: 'Regal suite once occupied by royal guests with handcrafted teakwood ceilings, royal bath, and private dining.',
        max_guests: 4,
        total_inventory: 6,
        price_per_night: 24000,
        photos: ['https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80'],
        is_active: true
      },
      // Goa Hotel Rooms
      {
        id: 'RM-301',
        hotel_id: 'HTL-003',
        room_name: 'Ocean Breeze Villa',
        room_type: 'Beach Villa',
        description: 'Private villa with direct pathway to Calangute beach, private sun deck, outdoor shower, and tropical garden.',
        max_guests: 3,
        total_inventory: 12,
        price_per_night: 6500,
        photos: ['https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80'],
        is_active: true
      },
      {
        id: 'RM-302',
        hotel_id: 'HTL-003',
        room_name: 'Poolside Premium Cottage',
        room_type: 'Cottage',
        description: 'Charming Goan cottage opening directly onto the resort swimming pool with private patio and loungers.',
        max_guests: 2,
        total_inventory: 18,
        price_per_night: 4800,
        photos: ['https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=800&q=80'],
        is_active: true
      }
    ];

    // 5. Bookings
    data.bookings = [
      {
        id: 'BKG-001',
        booking_code: 'HTL-94021',
        customer_id: 'USR-CUST-1',
        customer_name: 'Aarav Sharma',
        customer_email: 'aarav.sharma@gmail.com',
        customer_phone: '+91 98200 11928',
        hotel_id: 'HTL-001',
        hotel_name: 'The Grand Horizon Hotel & Suites',
        room_id: 'RM-101',
        room_name: 'Executive Deluxe Suite',
        check_in_date: '2026-08-25',
        check_out_date: '2026-08-28',
        nights: 3,
        guests_count: 2,
        base_amount: 25500,
        tax_amount: 3060,
        total_amount: 28560,
        commission_rate: 15,
        commission_amount: 4284,
        owner_payout: 24276,
        payment_status: 'successful',
        booking_status: 'confirmed',
        cancellation_reason: null,
        created_at: '2026-08-23T10:15:00Z'
      },
      {
        id: 'BKG-002',
        booking_code: 'HTL-94022',
        customer_id: 'USR-CUST-2',
        customer_name: 'Meera Iyer',
        customer_email: 'meera.iyer@outlook.com',
        customer_phone: '+91 99401 88372',
        hotel_id: 'HTL-002',
        hotel_name: 'Royal Heritage Palace & Spa',
        room_id: 'RM-202',
        room_name: 'Maharaja Royal Suite',
        check_in_date: '2026-08-22',
        check_out_date: '2026-08-24',
        nights: 2,
        guests_count: 2,
        base_amount: 48000,
        tax_amount: 5760,
        total_amount: 53760,
        commission_rate: 15,
        commission_amount: 8064,
        owner_payout: 45696,
        payment_status: 'successful',
        booking_status: 'checked_in',
        cancellation_reason: null,
        created_at: '2026-08-21T14:30:00Z'
      },
      {
        id: 'BKG-003',
        booking_code: 'HTL-94023',
        customer_id: 'USR-CUST-3',
        customer_name: 'Rohan Deshmukh',
        customer_email: 'rohan.d@gmail.com',
        customer_phone: '+91 98210 99481',
        hotel_id: 'HTL-003',
        hotel_name: 'Azure Bay Beach Resort & Club',
        room_id: 'RM-301',
        room_name: 'Ocean Breeze Villa',
        check_in_date: '2026-08-18',
        check_out_date: '2026-08-21',
        nights: 3,
        guests_count: 3,
        base_amount: 19500,
        tax_amount: 2340,
        total_amount: 21840,
        commission_rate: 15,
        commission_amount: 3276,
        owner_payout: 18564,
        payment_status: 'successful',
        booking_status: 'checked_out',
        cancellation_reason: null,
        created_at: '2026-08-16T12:00:00Z'
      },
      {
        id: 'BKG-004',
        booking_code: 'HTL-94024',
        customer_id: 'USR-CUST-4',
        customer_name: 'Ananya Verma',
        customer_email: 'ananya.v@yahoo.com',
        customer_phone: '+91 97110 44821',
        hotel_id: 'HTL-001',
        hotel_name: 'The Grand Horizon Hotel & Suites',
        room_id: 'RM-101',
        room_name: 'Executive Deluxe Suite',
        check_in_date: '2026-08-26',
        check_out_date: '2026-08-27',
        nights: 1,
        guests_count: 1,
        base_amount: 8500,
        tax_amount: 1020,
        total_amount: 9520,
        commission_rate: 15,
        commission_amount: 1428,
        owner_payout: 8092,
        payment_status: 'refunded',
        booking_status: 'cancelled',
        cancellation_reason: 'Flight cancelled due to heavy monsoon rains',
        created_at: '2026-08-22T08:20:00Z'
      }
    ];

    // 6. Payments
    data.payments = [
      {
        id: 'PAY-001',
        transaction_id: 'TXN-99482910',
        booking_id: 'BKG-001',
        booking_code: 'HTL-94021',
        customer_id: 'USR-CUST-1',
        customer_name: 'Aarav Sharma',
        hotel_name: 'The Grand Horizon Hotel & Suites',
        amount: 28560,
        payment_method: 'UPI (Google Pay)',
        gateway_reference: 'rzp_live_99482910',
        status: 'successful',
        created_at: '2026-08-23T10:16:00Z'
      },
      {
        id: 'PAY-002',
        transaction_id: 'TXN-88492011',
        booking_id: 'BKG-002',
        booking_code: 'HTL-94022',
        customer_id: 'USR-CUST-2',
        customer_name: 'Meera Iyer',
        hotel_name: 'Royal Heritage Palace & Spa',
        amount: 53760,
        payment_method: 'Credit Card (HDFC Visa)',
        gateway_reference: 'rzp_live_88492011',
        status: 'successful',
        created_at: '2026-08-21T14:31:00Z'
      },
      {
        id: 'PAY-003',
        transaction_id: 'TXN-77392019',
        booking_id: 'BKG-003',
        booking_code: 'HTL-94023',
        customer_id: 'USR-CUST-3',
        customer_name: 'Rohan Deshmukh',
        hotel_name: 'Azure Bay Beach Resort & Club',
        amount: 21840,
        payment_method: 'Net Banking (ICICI)',
        gateway_reference: 'rzp_live_77392019',
        status: 'successful',
        created_at: '2026-08-16T12:01:00Z'
      },
      {
        id: 'PAY-004',
        transaction_id: 'TXN-66492018',
        booking_id: 'BKG-004',
        booking_code: 'HTL-94024',
        customer_id: 'USR-CUST-4',
        customer_name: 'Ananya Verma',
        hotel_name: 'The Grand Horizon Hotel & Suites',
        amount: 9520,
        payment_method: 'UPI (PhonePe)',
        gateway_reference: 'rzp_live_66492018',
        status: 'refunded',
        created_at: '2026-08-22T08:21:00Z'
      }
    ];

    // 7. Refunds
    data.refunds = [
      {
        id: 'REF-001',
        refund_code: 'REF-8801',
        booking_id: 'BKG-004',
        booking_code: 'HTL-94024',
        customer_id: 'USR-CUST-4',
        customer_name: 'Ananya Verma',
        hotel_name: 'The Grand Horizon Hotel & Suites',
        booking_amount: 9520,
        fee_amount: 952,
        refund_amount: 8568,
        reason: 'Flight cancelled due to heavy monsoon rains',
        status: 'approved',
        admin_notes: '100% refund processed less 10% standard processing fee under policy.',
        requested_at: '2026-08-22T09:00:00Z',
        processed_at: '2026-08-22T14:15:00Z'
      },
      {
        id: 'REF-002',
        refund_code: 'REF-8802',
        booking_id: 'BKG-003',
        booking_code: 'HTL-94023',
        customer_id: 'USR-CUST-3',
        customer_name: 'Rohan Deshmukh',
        hotel_name: 'Azure Bay Beach Resort & Club',
        booking_amount: 21840,
        fee_amount: 2184,
        refund_amount: 19656,
        reason: 'Medical emergency in family, unable to travel.',
        status: 'pending',
        admin_notes: null,
        requested_at: '2026-08-23T08:30:00Z',
        processed_at: null
      }
    ];

    // 8. Reviews
    data.reviews = [
      {
        id: 'REV-001',
        booking_id: 'BKG-003',
        customer_id: 'USR-CUST-3',
        customer_name: 'Rohan Deshmukh',
        hotel_id: 'HTL-003',
        rating: 5,
        comment: 'Unbelievable beachfront location! The ocean breeze villa was immaculate and the Goan seafood was fresh and delicious.',
        created_at: '2026-08-21T18:00:00Z'
      },
      {
        id: 'REV-002',
        booking_id: 'BKG-002',
        customer_id: 'USR-CUST-2',
        customer_name: 'Meera Iyer',
        hotel_id: 'HTL-002',
        rating: 5,
        comment: 'True royal luxury. The Rajasthani architecture and live sitar performance during dinner made our anniversary unforgettable.',
        created_at: '2026-08-22T20:00:00Z'
      }
    ];

    // 9. Support Tickets
    data.support_tickets = [
      {
        id: 'TCK-001',
        ticket_code: 'TCK-501',
        user_id: 'USR-CUST-3',
        user_name: 'Rohan Deshmukh',
        user_email: 'rohan.d@gmail.com',
        user_role: 'customer',
        booking_id: 'BKG-003',
        booking_code: 'HTL-94023',
        hotel_id: 'HTL-003',
        subject: 'Request for early check-in at Azure Bay Resort',
        category: 'Booking & Room Allocation',
        priority: 'medium',
        status: 'resolved',
        messages: [
          { sender: 'customer', text: 'Hi, our flight reaches Goa at 9 AM. Can we get early check-in?', time: '2026-08-17 10:00 AM' },
          { sender: 'admin', text: 'Hello Rohan, we coordinated with Anthony (Hotel Owner). Room is ready and early check-in is granted complimentary!', time: '2026-08-17 11:30 AM' }
        ],
        created_at: '2026-08-17T10:00:00Z'
      },
      {
        id: 'TCK-002',
        ticket_code: 'TCK-502',
        user_id: 'USR-CUST-4',
        user_name: 'Ananya Verma',
        user_email: 'ananya.v@yahoo.com',
        user_role: 'customer',
        booking_id: 'BKG-004',
        booking_code: 'HTL-94024',
        hotel_id: 'HTL-001',
        subject: 'Urgent: Refund status for booking HTL-94024',
        category: 'Cancellation & Refund',
        priority: 'high',
        status: 'open',
        messages: [
          { sender: 'customer', text: 'I submitted cancellation request REF-8801 yesterday. When can I expect the bank credit?', time: '2026-08-23 08:45 AM' }
        ],
        created_at: '2026-08-23T08:45:00Z'
      }
    ];

    // 10. Platform Settings
    data.platform_settings = {
      commission_rate: 15,
      app_mode: 'live',
      payment_mode: 'production',
      cancellation_window_hours: 24,
      cancel_fee_pct: 10,
      support_email: 'support@hotelhub.com',
      support_phone: '+91 1800 200 8899',
      updated_at: new Date().toISOString()
    };
  });

  console.log('Database seeded successfully!');
}

// If run directly
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seedDatabase().then(() => process.exit(0));
}
