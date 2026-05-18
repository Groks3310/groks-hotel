const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const Room = require('../models/Room')
const User = require('../models/User')

const ROOMS = [
  { title: "Classic Deluxe Room", category: "Deluxe Room", roomNumber: "DR-101", floor: 1, size: 42, price: 85000, featured: false, isAvailable: true, capacity: { adults: 2, children: 1 }, description: "A sanctuary of understated elegance, our Classic Deluxe Room blends warm tones with premium materials. Floor-to-ceiling windows frame breathtaking city views while bespoke furnishings invite complete relaxation.", images: [{ url: "/section4.jpg", alt: "Deluxe Room" }], amenities: ["King Bed", "City View", "Free WiFi", "Smart TV", "Mini Bar", "Air Conditioning", "Room Service", "Safe Box", "Coffee Maker", "Marble Bathroom"], rating: { average: 0, count: 0 } },
  { title: "Premium Deluxe Room", category: "Deluxe Room", roomNumber: "DR-102", floor: 2, size: 48, price: 95000, featured: false, isAvailable: true, capacity: { adults: 2, children: 1 }, description: "An elevated take on the classic Deluxe experience with additional living space, premium sound system, and panoramic city views from private terrace access.", images: [{ url: "/section1.jpg", alt: "Premium Deluxe Room" }], amenities: ["King Bed", "Terrace Access", "Free WiFi", "Smart TV 65", "Premium Mini Bar", "Air Conditioning", "24hr Room Service", "Safe Box", "Nespresso Machine", "Rain Shower", "Bathtub"], rating: { average: 0, count: 0 } },
  { title: "Garden View Deluxe", category: "Deluxe Room", roomNumber: "DR-103", floor: 1, size: 44, price: 88000, featured: false, isAvailable: true, capacity: { adults: 2, children: 2 }, description: "Wake up to lush garden vistas in this serene Deluxe retreat with a private balcony overlooking our manicured grounds.", images: [{ url: "/section4.jpg", alt: "Garden View Deluxe" }], amenities: ["Queen Bed", "Garden View", "Private Balcony", "Free WiFi", "Smart TV", "Mini Bar", "Air Conditioning", "Room Service", "Coffee Maker", "Walk-in Shower"], rating: { average: 0, count: 0 } },
  { title: "Executive Suite", category: "Executive Suite", roomNumber: "ES-201", floor: 3, size: 85, price: 150000, featured: true, isAvailable: true, capacity: { adults: 2, children: 2 }, description: "The Executive Suite is an expansive refuge of refined luxury with a separate living room, dining area, and panoramic Lagos skyline views. Dedicated butler service ensures every need is anticipated.", images: [{ url: "/section4.jpg", alt: "Executive Suite" }, { url: "/section1.jpg", alt: "Executive Suite Living Room" }], amenities: ["King Bed", "Separate Living Room", "Dining Area", "Butler Service", "Free WiFi", "Dual Smart TVs", "Full Bar", "Air Conditioning", "24hr Room Service", "Walk-in Wardrobe", "Jacuzzi", "Rain Shower", "Bathtub", "Premium Toiletries", "Evening Turndown"], rating: { average: 0, count: 0 } },
  { title: "Skyline Executive Suite", category: "Executive Suite", roomNumber: "ES-202", floor: 4, size: 95, price: 175000, featured: true, isAvailable: true, capacity: { adults: 3, children: 2 }, description: "Perched on the fourth floor with spectacular wraparound views of Lagos. A private study, expansive bedroom, and fully stocked premium bar make this suite a destination in itself.", images: [{ url: "/section4.jpg", alt: "Skyline Executive Suite" }, { url: "/section2.jpg", alt: "Skyline View" }], amenities: ["King Bed", "Panoramic City View", "Private Study", "Butler Service", "Free WiFi", "Smart TV 75", "Premium Full Bar", "Air Conditioning", "24hr Room Service", "Walk-in Wardrobe", "Jacuzzi", "Steam Shower", "Heated Floors", "Premium Toiletries", "Airport Transfer"], rating: { average: 0, count: 0 } },
  { title: "Lagoon Executive Suite", category: "Executive Suite", roomNumber: "ES-203", floor: 5, size: 90, price: 165000, featured: false, isAvailable: true, capacity: { adults: 2, children: 1 }, description: "Inspired by the tranquil waters of the Lagos Lagoon with calming interiors, a soaking tub with lagoon views, and an expansive private terrace perfect for sunset cocktails.", images: [{ url: "/section1.jpg", alt: "Lagoon Suite" }], amenities: ["King Bed", "Lagoon View Terrace", "Soaking Tub", "Butler Service", "Free WiFi", "Dual Smart TVs", "Premium Mini Bar", "Air Conditioning", "24hr Room Service", "Walk-in Wardrobe", "Rain Shower", "Premium Toiletries", "Evening Turndown", "Complimentary Breakfast"], rating: { average: 0, count: 0 } },
  { title: "Presidential Suite", category: "Presidential Suite", roomNumber: "PS-301", floor: 6, size: 200, price: 350000, featured: true, isAvailable: true, capacity: { adults: 4, children: 2 }, description: "The crown jewel of Groks Hotel. An entire floor of uncompromising luxury with two master bedrooms, grand living room, private dining room, fully equipped kitchen, and dedicated staff.", images: [{ url: "/section4.jpg", alt: "Presidential Suite" }, { url: "/section1.jpg", alt: "Presidential Suite Living Room" }], amenities: ["2 Master Bedrooms", "Grand Living Room", "Private Dining Room", "Full Kitchen", "Dedicated Butler", "Free WiFi", "Multiple Smart TVs", "Full Premium Bar", "Air Conditioning", "24hr Concierge", "Private Terrace", "Jacuzzi", "Sauna", "Steam Room", "Rain Shower", "Heated Floors", "Luxury Toiletries", "Airport Transfer", "Complimentary Breakfast & Dinner", "Limousine Service"], rating: { average: 0, count: 0 } },
  { title: "Royal Presidential Suite", category: "Presidential Suite", roomNumber: "PS-302", floor: 7, size: 280, price: 500000, featured: true, isAvailable: true, capacity: { adults: 6, children: 4 }, description: "Beyond luxury. Two floors connected by a private staircase with custom furnishings, private infinity pool, home cinema, wine cellar, and around-the-clock personal staff.", images: [{ url: "/section4.jpg", alt: "Royal Presidential Suite" }, { url: "/section2.jpg", alt: "Royal Suite Exterior" }], amenities: ["3 Master Bedrooms", "Private Infinity Pool", "Home Cinema", "Wine Cellar", "Full Kitchen", "Dedicated Butler x2", "Personal Chef", "Free WiFi", "Smart TVs Throughout", "Full Premium Bar", "Air Conditioning", "24hr Concierge", "Wraparound Terrace", "Jacuzzi x2", "Sauna & Steam Room", "Gym Equipment", "Rolls-Royce Transfer", "All Meals Included"], rating: { average: 0, count: 0 } },
  { title: "Family Comfort Room", category: "Family Room", roomNumber: "FR-401", floor: 2, size: 75, price: 120000, featured: false, isAvailable: true, capacity: { adults: 2, children: 3 }, description: "Designed with families in mind with generous space, one king bed and two twin beds, a dedicated play corner for children, and a large bathroom with both bath and shower.", images: [{ url: "/section1.jpg", alt: "Family Room" }], amenities: ["1 King Bed + 2 Twin Beds", "Children Play Corner", "Free WiFi", "Smart TV", "Mini Bar", "Air Conditioning", "Room Service", "Safe Box", "Coffee Maker", "Bathtub & Shower", "Children Amenities Kit", "Baby Cot on request"], rating: { average: 0, count: 0 } },
  { title: "Family Suite", category: "Family Room", roomNumber: "FR-402", floor: 3, size: 110, price: 180000, featured: false, isAvailable: true, capacity: { adults: 4, children: 4 }, description: "The ultimate family retreat with two connecting rooms, a master bedroom for parents and a children's room with bunk beds, shared living area and kitchenette.", images: [{ url: "/section4.jpg", alt: "Family Suite" }, { url: "/section1.jpg", alt: "Family Suite Living Area" }], amenities: ["Master Bedroom", "Children Room with Bunk Beds", "Shared Living Area", "Kitchenette", "Free WiFi", "Dual Smart TVs", "Kids Entertainment System", "Mini Bar", "Air Conditioning", "24hr Room Service", "Bathtub & Shower", "Children Amenities", "Baby Cot Available", "Complimentary Kids Breakfast"], rating: { average: 0, count: 0 } },
  { title: "Luxury Family Villa", category: "Family Room", roomNumber: "FR-403", floor: 1, size: 160, price: 250000, featured: true, isAvailable: true, capacity: { adults: 4, children: 6 }, description: "A private villa experience for the entire family with a private garden, three bedrooms, two full bathrooms, fully equipped kitchen, and sprawling living area.", images: [{ url: "/section2.jpg", alt: "Family Villa" }, { url: "/section4.jpg", alt: "Family Villa Bedroom" }], amenities: ["3 Bedrooms", "Private Garden", "Full Kitchen", "Shared Living & Dining", "Butler Service", "Free WiFi", "Multiple Smart TVs", "Full Bar", "Air Conditioning", "24hr Room Service", "2 Full Bathrooms", "Children Amenities Kit", "Baby Cot x2", "Outdoor BBQ", "Pool Access Priority", "Complimentary Kids Breakfast", "Nanny Service on request"], rating: { average: 0, count: 0 } },
]

// Secret key to protect this route
const SEED_SECRET = 'groks-seed-2024'

router.get('/:secret', async (req, res) => {
  if (req.params.secret !== SEED_SECRET) {
    return res.status(403).json({ message: 'Forbidden' })
  }
  try {
    await Room.deleteMany({})
    await User.deleteMany({})

    const hashedAdmin = await bcrypt.hash('admin123456', 12)
    await User.create({ name: 'Groks Admin', email: 'admin@grokshotel.com', password: hashedAdmin, role: 'admin', phone: '+2348000000000', avatar: '' })

    const hashedGuest = await bcrypt.hash('guest123456', 12)
    await User.create({ name: 'Amara Okafor', email: 'guest@grokshotel.com', password: hashedGuest, role: 'user', phone: '+2348111111111', avatar: '' })

    await Room.insertMany(ROOMS)

    res.json({
      success: true,
      message: '✅ Database seeded successfully!',
      rooms: ROOMS.length,
      admin: 'admin@grokshotel.com / admin123456',
      guest: 'guest@grokshotel.com / guest123456'
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

module.exports = router