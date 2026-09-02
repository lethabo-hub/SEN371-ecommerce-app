// Seeds an admin account, a demo shopper, a focused catalog of outdoor gear,
// and a handful of starter reviews so the storefront never looks empty.
// Run with: node seed.js  (or npm run seed)
const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('./src/config/db');
const User = require('./src/models/User');
const Product = require('./src/models/Product');
const Review = require('./src/models/Review');

const products = [
  {
    name: 'TrailForge 40L Backpack',
    description: 'A weatherproof 40-litre pack built for multi-day routes. Ventilated back panel, adjustable torso length, and a rain cover tucked into the base pocket so you can move fast when the sky turns.',
    price: 1899,
    category: 'Backpacks',
    stock: 22,
    imageUrl: 'https://images.unsplash.com/photo-1726099234440-c73c3a85bc00?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Summit Ridge Leather Boots',
    description: 'Full-grain leather boots broken in from the first mile. A sticky rubber outsole grips wet rock and loose scree, and the ankle collar is padded for long descents.',
    price: 1699,
    category: 'Footwear',
    stock: 30,
    imageUrl: 'https://images.unsplash.com/photo-1575987116913-e96e7d490b8a?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Ridgeline 2-Person Tent',
    description: 'A freestanding two-person shelter that pitches in under four minutes. Twin doors, twin vestibules, and a taped-seam fly keep you dry through a full night of rain.',
    price: 3299,
    category: 'Shelter',
    stock: 14,
    imageUrl: 'https://images.unsplash.com/photo-1476041800959-2f6bb412c8ce?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Horizon Polarized Trail Sunglasses',
    description: 'Polarized lenses cut glare off snow, water, and pale rock, with a wraparound frame that stays put on scrambles. Comes with a hard case and a microfibre pouch.',
    price: 899,
    category: 'Accessories',
    stock: 40,
    imageUrl: 'https://images.unsplash.com/photo-1681147767903-9011e9bf9e83?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Basecamp Essentials Kit',
    description: 'Everything you reach for before first light: a field jacket, a paper map, a pocket watch, and a place for your camera. Assembled by our guides as the one bundle worth packing first.',
    price: 1299,
    category: 'Accessories',
    stock: 18,
    imageUrl: 'https://images.unsplash.com/photo-1485809052957-5113b0ff51af?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Wayfinder Brass Compass',
    description: 'A liquid-filled brass compass with a sighting mirror for accurate bearings when the trail markers run out. Small enough for a jacket pocket, sturdy enough to last decades.',
    price: 459,
    category: 'Accessories',
    stock: 45,
    imageUrl: 'https://images.unsplash.com/photo-1488628176578-4ffd5fdbc900?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Alpine Frost -10°C Sleeping Bag',
    description: 'A mummy-cut sleeping bag rated to -10°C, filled with water-resistant synthetic insulation that keeps its loft even on damp nights. Packs down to the size of a loaf of bread.',
    price: 2199,
    category: 'Shelter',
    stock: 16,
    imageUrl: 'https://images.unsplash.com/photo-1698521633875-662175c1654b?auto=format&fit=crop&w=900&q=80',
  },
];

const reviewersPool = [
  { name: 'Naledi M.', rating: 5, comment: 'Used this on the Otter Trail and it held up through two days of solid rain. Genuinely impressed.' },
  { name: 'Connor B.', rating: 4, comment: 'Great quality for the price. Took a star off only because sizing ran slightly large.' },
  { name: 'Priya R.', rating: 5, comment: 'This has completely changed how I pack for weekend trips. Worth every cent.' },
  { name: 'Jason T.', rating: 5, comment: 'Bought this after my old gear fell apart mid-hike. Should have switched years ago.' },
  { name: 'Amahle K.', rating: 4, comment: 'Solid build quality, arrived well packaged. Would buy from this brand again.' },
  { name: 'Liam O.', rating: 5, comment: 'Took it up Table Mountain and back down in the wind — no complaints at all.' },
];

const run = async () => {
  await connectDB();

  await User.deleteMany({ email: { $in: ['admin@shopwave.com', 'demo@shopwave.com'] } });
  const admin = await User.create({
    name: 'Store Admin',
    email: 'admin@shopwave.com',
    password: 'Admin@123',
    role: 'admin',
  });
  const demoUser = await User.create({
    name: 'Demo Shopper',
    email: 'demo@shopwave.com',
    password: 'Demo@123',
    role: 'customer',
  });

  await Product.deleteMany({});
  await Review.deleteMany({});

  const created = await Product.insertMany(
    products.map((p) => ({ ...p, createdBy: admin._id }))
  );

  // Give most products two or three starter reviews so the store never opens empty.
  for (const product of created) {
    const reviewCount = 2 + Math.floor(Math.random() * 2);
    const shuffled = [...reviewersPool].sort(() => 0.5 - Math.random());
    const chosen = shuffled.slice(0, reviewCount);

    const reviewDocs = chosen.map((r) => ({
      product: product._id,
      user: demoUser._id,
      name: r.name,
      rating: r.rating,
      comment: r.comment,
    }));

    // Reviews require a unique (product, user) pair in the schema, so only the
    // first seeded review per product is attributed to the demo account; the
    // rest are inserted directly to represent other shoppers.
    await Review.create({ ...reviewDocs[0] });
    for (let i = 1; i < reviewDocs.length; i += 1) {
      const doc = new Review(reviewDocs[i]);
      doc.user = admin._id; // distinct user id so the unique index is satisfied
      await doc.save();
    }

    const avg = chosen.reduce((sum, r) => sum + r.rating, 0) / chosen.length;
    await Product.findByIdAndUpdate(product._id, {
      averageRating: Math.round(avg * 10) / 10,
      numReviews: chosen.length,
    });
  }

  console.log('Seed complete.');
  console.log('Admin login:  admin@shopwave.com / Admin@123');
  console.log('Demo login:   demo@shopwave.com / Demo@123');
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
