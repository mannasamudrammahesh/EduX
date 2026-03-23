/**
 * Fix User Roles and Onboarding Status Script
 * This script ensures all users have proper roles and onboarding status
 * Run: node scripts/fixUserRoles.js
 */

const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');

async function fixUserRoles() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000
    });
    console.log('✅ Connected to MongoDB\n');

    // Get all users
    const users = await User.find({});
    console.log(`📊 Found ${users.length} users\n`);

    let fixed = 0;
    let alreadyCorrect = 0;

    for (const user of users) {
      let needsUpdate = false;
      const updates = {};

      // Check role
      if (!user.role || !['STUDENT', 'EDUCATOR', 'ADMIN'].includes(user.role)) {
        updates.role = 'STUDENT';
        needsUpdate = true;
        console.log(`🔧 Fixing role for ${user.email}: ${user.role} → STUDENT`);
      }

      // Check onboarding status
      if (user.isOnboarded === undefined || user.isOnboarded === null) {
        // If user has username and other profile fields, mark as onboarded
        if (user.username && user.username.length >= 3) {
          updates.isOnboarded = true;
          needsUpdate = true;
          console.log(`🔧 Marking ${user.email} as onboarded`);
        } else {
          updates.isOnboarded = false;
          needsUpdate = true;
          console.log(`🔧 Marking ${user.email} as not onboarded`);
        }
      }

      // Ensure username exists
      if (!user.username || user.username.length < 3) {
        // Generate username from email
        const emailUsername = user.email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '');
        let newUsername = emailUsername;
        let counter = 1;
        
        // Check if username exists
        while (await User.findOne({ username: newUsername, _id: { $ne: user._id } })) {
          newUsername = `${emailUsername}${counter}`;
          counter++;
        }
        
        updates.username = newUsername;
        needsUpdate = true;
        console.log(`🔧 Setting username for ${user.email}: ${newUsername}`);
      }

      if (needsUpdate) {
        await User.findByIdAndUpdate(user._id, updates);
        fixed++;
      } else {
        alreadyCorrect++;
      }
    }

    console.log('\n📊 Summary:');
    console.log(`✅ Fixed: ${fixed} users`);
    console.log(`✓  Already correct: ${alreadyCorrect} users`);
    console.log(`📝 Total: ${users.length} users`);

    // Show role distribution
    const roleStats = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);
    
    console.log('\n👥 Role Distribution:');
    roleStats.forEach(stat => {
      console.log(`   ${stat._id}: ${stat.count}`);
    });

    // Show onboarding status
    const onboardedCount = await User.countDocuments({ isOnboarded: true });
    const notOnboardedCount = await User.countDocuments({ isOnboarded: false });
    
    console.log('\n📋 Onboarding Status:');
    console.log(`   Onboarded: ${onboardedCount}`);
    console.log(`   Not Onboarded: ${notOnboardedCount}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the fix
fixUserRoles();
