// Seed script runner
require('dotenv').config();
const mongoose = require('mongoose');
const { seedFraudDatabase } = require('./FraudDatabaseSeeder');

const runSeeder = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Run the seeder
    await seedFraudDatabase();

    // Close connection
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    
  } catch (error) {
    console.error('❌ Seeder error:', error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  runSeeder();
}

module.exports = runSeeder;