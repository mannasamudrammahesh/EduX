/**
 * Diagnostic Script
 * Checks your MongoDB connection and user configuration
 * Run: node scripts/diagnose.js
 */

const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');
const Course = require('../models/Course');

async function diagnose() {
  console.log('🔍 EduX Platform Diagnostic Tool\n');
  console.log('='.repeat(50));

  try {
    // Check environment variables
    console.log('\n📋 Environment Variables:');
    console.log('   MONGODB_URI:', process.env.MONGODB_URI ? '✅ Set' : '❌ Not set');
    console.log('   JWT_SECRET:', process.env.JWT_SECRET ? '✅ Set' : '❌ Not set');
    console.log('   CLIENT_URL:', process.env.CLIENT_URL || 'Not set');
    console.log('   NODE_ENV:', process.env.NODE_ENV || 'Not set');

    // Check MongoDB URI type
    if (process.env.MONGODB_URI) {
      if (process.env.MONGODB_URI.includes('127.0.0.1') || process.env.MONGODB_URI.includes('localhost')) {
        console.log('   Database Type: 🏠 Local MongoDB');
      } else if (process.env.MONGODB_URI.includes('mongodb+srv')) {
        console.log('   Database Type: ☁️  MongoDB Atlas');
      } else {
        console.log('   Database Type: ❓ Unknown');
      }
    }

    // Try to connect
    console.log('\n🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000
    });
    console.log('✅ Connected successfully!');
    console.log('   Database:', mongoose.connection.name);
    console.log('   Host:', mongoose.connection.host);

    // Check collections
    console.log('\n📊 Database Statistics:');
    const userCount = await User.countDocuments();
    const courseCount = await Course.countDocuments();
    console.log('   Users:', userCount);
    console.log('   Courses:', courseCount);

    // Check user roles
    console.log('\n👥 User Role Distribution:');
    const roleStats = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);
    
    if (roleStats.length === 0) {
      console.log('   ⚠️  No users found');
    } else {
      roleStats.forEach(stat => {
        console.log(`   ${stat._id || 'undefined'}: ${stat.count}`);
      });
    }

    // Check onboarding status
    const onboardedCount = await User.countDocuments({ isOnboarded: true });
    const notOnboardedCount = await User.countDocuments({ isOnboarded: false });
    console.log('\n📋 Onboarding Status:');
    console.log('   Onboarded:', onboardedCount);
    console.log('   Not Onboarded:', notOnboardedCount);

    // List educators
    console.log('\n🎓 Educators:');
    const educators = await User.find({ role: 'EDUCATOR' })
      .select('name email username isOnboarded')
      .limit(10);
    
    if (educators.length === 0) {
      console.log('   ⚠️  No educators found');
      console.log('   💡 You need to set at least one user role to EDUCATOR');
    } else {
      educators.forEach(edu => {
        const status = edu.isOnboarded ? '✅' : '❌';
        console.log(`   ${status} ${edu.name} (${edu.email}) - ${edu.username}`);
      });
    }

    // Check for users without proper setup
    console.log('\n⚠️  Users Needing Attention:');
    const usersNeedingFix = await User.find({
      $or: [
        { role: { $exists: false } },
        { role: null },
        { role: '' },
        { username: { $exists: false } },
        { username: null },
        { username: '' },
        { isOnboarded: { $exists: false } },
        { isOnboarded: null }
      ]
    }).select('name email role username isOnboarded').limit(10);

    if (usersNeedingFix.length === 0) {
      console.log('   ✅ All users are properly configured');
    } else {
      console.log(`   Found ${usersNeedingFix.length} users with issues:`);
      usersNeedingFix.forEach(user => {
        const issues = [];
        if (!user.role) issues.push('no role');
        if (!user.username) issues.push('no username');
        if (user.isOnboarded === undefined || user.isOnboarded === null) issues.push('onboarding status not set');
        console.log(`   - ${user.email}: ${issues.join(', ')}`);
      });
      console.log('\n   💡 Run: node scripts/fixUserRoles.js');
    }

    // Recommendations
    console.log('\n💡 Recommendations:');
    
    if (process.env.MONGODB_URI && process.env.MONGODB_URI.includes('127.0.0.1')) {
      console.log('   ⚠️  You are using local MongoDB');
      console.log('      For production, migrate to MongoDB Atlas');
      console.log('      Run: node scripts/exportLocalData.js');
    }

    if (educators.length === 0) {
      console.log('   ⚠️  No educators found');
      console.log('      Set a user role to EDUCATOR to create courses');
      console.log('      Run: node scripts/fixUserRoles.js');
    }

    if (usersNeedingFix.length > 0) {
      console.log('   ⚠️  Some users need configuration fixes');
      console.log('      Run: node scripts/fixUserRoles.js');
    }

    if (onboardedCount === 0 && userCount > 0) {
      console.log('   ⚠️  No users have completed onboarding');
      console.log('      Users need to complete profile setup');
    }

    console.log('\n' + '='.repeat(50));
    console.log('✅ Diagnostic complete!\n');

  } catch (error) {
    console.error('\n❌ Diagnostic failed:', error.message);
    
    if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
      console.log('\n💡 Troubleshooting:');
      console.log('   - Check your MongoDB connection string');
      console.log('   - Verify your cluster is running');
      console.log('   - Check your internet connection');
    } else if (error.message.includes('authentication failed')) {
      console.log('\n💡 Troubleshooting:');
      console.log('   - Check your database username and password');
      console.log('   - Verify credentials in .env file');
    } else if (error.message.includes('timeout')) {
      console.log('\n💡 Troubleshooting:');
      console.log('   - Check MongoDB Atlas IP whitelist');
      console.log('   - Add 0.0.0.0/0 to allow all IPs');
      console.log('   - Verify cluster is not paused');
    }
    
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
}

// Run diagnostic
diagnose();
