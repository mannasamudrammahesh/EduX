/**
 * Test MongoDB Atlas Connection
 * Quick script to verify your Atlas connection works
 */

const mongoose = require('mongoose');
require('dotenv').config();

async function testConnection() {
  console.log('🧪 Testing MongoDB Atlas Connection...\n');
  
  try {
    console.log('Connection String:', process.env.MONGODB_URI.replace(/:[^:@]+@/, ':****@'));
    console.log('\n🔌 Connecting...');
    
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000
    });
    
    console.log('✅ Connected successfully!');
    console.log('   Database:', mongoose.connection.name);
    console.log('   Host:', mongoose.connection.host);
    
    // Test a simple query
    const User = require('../models/User');
    const userCount = await User.countDocuments();
    const educators = await User.countDocuments({ role: 'EDUCATOR' });
    
    console.log('\n📊 Quick Stats:');
    console.log('   Total Users:', userCount);
    console.log('   Educators:', educators);
    
    // Find your account
    const yourAccount = await User.findOne({ email: 'maheshh130506@gmail.com' });
    if (yourAccount) {
      console.log('\n👤 Your Account:');
      console.log('   Name:', yourAccount.name);
      console.log('   Email:', yourAccount.email);
      console.log('   Role:', yourAccount.role);
      console.log('   Onboarded:', yourAccount.isOnboarded);
      console.log('   Username:', yourAccount.username);
      
      if (yourAccount.role === 'EDUCATOR' && yourAccount.isOnboarded) {
        console.log('\n✅ Perfect! You can create courses!');
      } else {
        console.log('\n⚠️  Issue detected:');
        if (yourAccount.role !== 'EDUCATOR') {
          console.log('   - Role is not EDUCATOR');
        }
        if (!yourAccount.isOnboarded) {
          console.log('   - Not onboarded');
        }
      }
    } else {
      console.log('\n⚠️  Account not found: maheshh130506@gmail.com');
    }
    
    console.log('\n🎉 Connection test passed!');
    
  } catch (error) {
    console.error('\n❌ Connection test failed:', error.message);
    
    if (error.message.includes('ENOTFOUND')) {
      console.log('\n💡 Troubleshooting:');
      console.log('   - Check your connection string');
      console.log('   - Verify cluster name is correct');
    } else if (error.message.includes('authentication failed')) {
      console.log('\n💡 Troubleshooting:');
      console.log('   - Check username and password');
      console.log('   - Verify database user exists in Atlas');
    }
    
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected\n');
  }
}

testConnection();
