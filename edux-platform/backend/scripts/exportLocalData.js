/**
 * Export Local MongoDB Data Script
 * This script exports all data from your local MongoDB to JSON files
 * Run: node scripts/exportLocalData.js
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

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

// Local MongoDB connection
const LOCAL_MONGODB_URI = 'mongodb://127.0.0.1:27017/edux_platform';

// Output directory
const OUTPUT_DIR = path.join(__dirname, '../data-export');

async function exportData() {
  try {
    console.log('🔌 Connecting to local MongoDB...');
    await mongoose.connect(LOCAL_MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log('✅ Connected to local MongoDB\n');

    // Create output directory
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    // Define collections to export
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

    let totalDocuments = 0;

    // Export each collection
    for (const collection of collections) {
      try {
        const data = await collection.model.find({}).lean();
        const filePath = path.join(OUTPUT_DIR, `${collection.name}.json`);
        
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        
        console.log(`✅ Exported ${data.length} documents from ${collection.name}`);
        totalDocuments += data.length;
      } catch (error) {
        console.log(`⚠️  Skipped ${collection.name}: ${error.message}`);
      }
    }

    console.log(`\n🎉 Export completed! Total documents: ${totalDocuments}`);
    console.log(`📁 Data exported to: ${OUTPUT_DIR}`);
    console.log('\n📝 Next steps:');
    console.log('1. Update your .env file with MongoDB Atlas connection string');
    console.log('2. Run: node scripts/importToAtlas.js');

  } catch (error) {
    console.error('❌ Export failed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run export
exportData();
