/**
 * Import Data to MongoDB Atlas Script
 * This script imports all exported data to MongoDB Atlas
 * Run: node scripts/importToAtlas.js
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Import all models
const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Certificate = require('../models/Certificate');
const UserProgress = require('../models/UserProgress');
const LessonProgress = require('../models/LessonProgress');
const Note = require('../models/Note');
const Post = require('../models/Post');
const Notification = require('../models/Notification');
const QuizAttempt = require('../models/QuizAttempt');
const Review = require('../models/Review');
const SpinHistory = require('../models/SpinHistory');
const SpinReward = require('../models/SpinReward');
const ActivityLog = require('../models/ActivityLog');
const Challenge = require('../models/Challenge');
const ChatSession = require('../models/ChatSession');
const UserSettings = require('../models/UserSettings');
const PlatformSignature = require('../models/PlatformSignature');

// Input directory
const INPUT_DIR = path.join(__dirname, '../data-export');

async function importData() {
  try {
    console.log('🔌 Connecting to MongoDB Atlas...');
    
    if (!process.env.MONGODB_URI || process.env.MONGODB_URI.includes('127.0.0.1')) {
      throw new Error('Please update MONGODB_URI in .env file with your Atlas connection string');
    }

    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000
    });
    console.log('✅ Connected to MongoDB Atlas\n');

    // Check if data-export directory exists
    if (!fs.existsSync(INPUT_DIR)) {
      throw new Error(`Data export directory not found: ${INPUT_DIR}\nPlease run exportLocalData.js first`);
    }

    // Define collections to import (order matters for dependencies)
    const collections = [
      { name: 'users', model: User },
      { name: 'courses', model: Course },
      { name: 'enrollments', model: Enrollment },
      { name: 'certificates', model: Certificate },
      { name: 'userprogresses', model: UserProgress },
      { name: 'lessonprogresses', model: LessonProgress },
      { name: 'notes', model: Note },
      { name: 'posts', model: Post },
      { name: 'notifications', model: Notification },
      { name: 'quizattempts', model: QuizAttempt },
      { name: 'reviews', model: Review },
      { name: 'spinhistories', model: SpinHistory },
      { name: 'spinrewards', model: SpinReward },
      { name: 'activitylogs', model: ActivityLog },
      { name: 'challenges', model: Challenge },
      { name: 'chatsessions', model: ChatSession },
      { name: 'usersettings', model: UserSettings },
      { name: 'platformsignatures', model: PlatformSignature }
    ];

    let totalImported = 0;

    // Import each collection
    for (const collection of collections) {
      try {
        const filePath = path.join(INPUT_DIR, `${collection.name}.json`);
        
        if (!fs.existsSync(filePath)) {
          console.log(`⚠️  Skipped ${collection.name}: file not found`);
          continue;
        }

        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        if (data.length === 0) {
          console.log(`⚠️  Skipped ${collection.name}: no data`);
          continue;
        }

        // Check if collection already has data
        const existingCount = await collection.model.countDocuments();
        
        if (existingCount > 0) {
          console.log(`⚠️  ${collection.name} already has ${existingCount} documents. Skipping...`);
          console.log(`   To force import, delete the collection first or use --force flag`);
          continue;
        }

        // For users, we need to handle password hashing differently
        if (collection.name === 'users') {
          // Import users one by one to trigger pre-save hooks
          let imported = 0;
          for (const userData of data) {
            try {
              // Check if user already exists
              const existing = await User.findOne({ email: userData.email });
              if (!existing) {
                // Password is already hashed in export, so we skip hashing
                const user = new User(userData);
                user.isModified = () => false; // Prevent re-hashing
                await user.save({ validateBeforeSave: false });
                imported++;
              }
            } catch (err) {
              console.log(`   ⚠️  Failed to import user ${userData.email}: ${err.message}`);
            }
          }
          console.log(`✅ Imported ${imported}/${data.length} documents to ${collection.name}`);
          totalImported += imported;
        } else {
          // Bulk insert for other collections
          const result = await collection.model.insertMany(data, { 
            ordered: false,
            rawResult: true 
          });
          console.log(`✅ Imported ${result.insertedCount || data.length} documents to ${collection.name}`);
          totalImported += (result.insertedCount || data.length);
        }

      } catch (error) {
        if (error.code === 11000) {
          console.log(`⚠️  Some documents in ${collection.name} already exist (duplicate key)`);
        } else {
          console.log(`⚠️  Error importing ${collection.name}: ${error.message}`);
        }
      }
    }

    console.log(`\n🎉 Import completed! Total documents imported: ${totalImported}`);
    console.log('\n📝 Next steps:');
    console.log('1. Verify data in MongoDB Atlas dashboard');
    console.log('2. Update Vercel environment variables with Atlas connection string');
    console.log('3. Redeploy your application');

  } catch (error) {
    console.error('❌ Import failed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB Atlas');
  }
}

// Run import
importData();
