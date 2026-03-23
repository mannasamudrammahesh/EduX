/**
 * Quick Fix for Atlas Database
 * This script fixes common issues with user roles and onboarding
 * Run: node scripts/quickFixAtlas.js <your-email>
 */

const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');

const userEmail = process.argv[2];

async function quickFix() {
  try {
    if (!userEmail) {
      console.log('❌ Please provide your email address');
      console.log('Usage: node scripts/quickFixAtlas.js your-email@example.com');
      process.exit(1);
    }

    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000
    });
    console.log('✅ Connected to MongoDB\n');

    // Find user
    const user = await User.findOne({ email: userEmail });

    if (!user) {
      console.log(`❌ User not found: ${userEmail}`);
      console.log('\nAvailable users:');
      const allUsers = await User.find({}).select('email name').limit(10);
      allUsers.forEach(u => console.log(`   - ${u.email} (${u.name})`));
      process.exit(1);
    }

    console.log('👤 Found user:', user.name);
    console.log('   Email:', user.email);
    console.log('   Current Role:', user.role || 'NOT SET');
    console.log('   Username:', user.username || 'NOT SET');
    console.log('   Onboarded:', user.isOnboarded ? 'Yes' : 'No');

    // Prepare updates
    const updates = {};
    let needsUpdate = false;

    // Fix role
    if (!user.role || !['STUDENT', 'EDUCATOR', 'ADMIN'].includes(user.role)) {
      updates.role = 'EDUCATOR'; // Default to EDUCATOR for course creation
      needsUpdate = true;
      console.log('\n🔧 Will set role to: EDUCATOR');
    }

    // Fix username
    if (!user.username || user.username.length < 3) {
      const emailUsername = user.email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '');
      let newUsername = emailUsername;
      let counter = 1;
      
      while (await User.findOne({ username: newUsername, _id: { $ne: user._id } })) {
        newUsername = `${emailUsername}${counter}`;
        counter++;
      }
      
      updates.username = newUsername;
      needsUpdate = true;
      console.log('🔧 Will set username to:', newUsername);
    }

    // Fix onboarding
    if (!user.isOnboarded) {
      updates.isOnboarded = true;
      needsUpdate = true;
      console.log('🔧 Will mark as onboarded: true');
    }

    if (!needsUpdate) {
      console.log('\n✅ User is already properly configured!');
      console.log('   Role:', user.role);
      console.log('   Username:', user.username);
      console.log('   Onboarded:', user.isOnboarded);
    } else {
      console.log('\n🔄 Applying updates...');
      await User.findByIdAndUpdate(user._id, updates);
      console.log('✅ User updated successfully!');

      // Fetch updated user
      const updatedUser = await User.findById(user._id);
      console.log('\n📊 Updated user info:');
      console.log('   Role:', updatedUser.role);
      console.log('   Username:', updatedUser.username);
      console.log('   Onboarded:', updatedUser.isOnboarded);
    }

    console.log('\n🎉 Done! You can now:');
    console.log('   1. Login to https://eduxai.xyz');
    console.log('   2. Navigate to Creator Studio');
    console.log('   3. Create courses as an educator');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run quick fix
quickFix();
