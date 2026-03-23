/**
 * Cleanup Orphaned Data Script
 * Removes enrollments and other references to deleted courses/users
 * Run: node scripts/cleanupOrphanedData.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

const Enrollment = require('../models/Enrollment');
const Certificate = require('../models/Certificate');
const UserProgress = require('../models/UserProgress');
const Course = require('../models/Course');
const User = require('../models/User');

async function cleanupOrphanedData() {
  try {
    console.log('🧹 Starting cleanup of orphaned data...\n');
    
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000
    });
    console.log('✅ Connected to MongoDB\n');

    let totalCleaned = 0;

    // 1. Clean up enrollments with deleted courses
    console.log('1️⃣  Checking enrollments...');
    const enrollments = await Enrollment.find({}).lean();
    console.log(`   Found ${enrollments.length} enrollments`);
    
    let orphanedEnrollments = 0;
    for (const enrollment of enrollments) {
      const courseExists = await Course.findById(enrollment.courseId);
      if (!courseExists) {
        await Enrollment.findByIdAndDelete(enrollment._id);
        orphanedEnrollments++;
      }
    }
    
    if (orphanedEnrollments > 0) {
      console.log(`   ✅ Removed ${orphanedEnrollments} orphaned enrollments`);
      totalCleaned += orphanedEnrollments;
    } else {
      console.log(`   ✓  No orphaned enrollments found`);
    }

    // 2. Clean up certificates with deleted courses/users
    console.log('\n2️⃣  Checking certificates...');
    const certificates = await Certificate.find({}).lean();
    console.log(`   Found ${certificates.length} certificates`);
    
    let orphanedCertificates = 0;
    for (const cert of certificates) {
      const courseExists = await Course.findById(cert.courseId);
      const userExists = await User.findById(cert.userId);
      
      if (!courseExists || !userExists) {
        await Certificate.findByIdAndDelete(cert._id);
        orphanedCertificates++;
      }
    }
    
    if (orphanedCertificates > 0) {
      console.log(`   ✅ Removed ${orphanedCertificates} orphaned certificates`);
      totalCleaned += orphanedCertificates;
    } else {
      console.log(`   ✓  No orphaned certificates found`);
    }

    // 3. Clean up user progress with deleted courses
    console.log('\n3️⃣  Checking user progress...');
    const userProgresses = await UserProgress.find({}).lean();
    console.log(`   Found ${userProgresses.length} progress records`);
    
    let orphanedProgress = 0;
    for (const progress of userProgresses) {
      const courseExists = await Course.findById(progress.course);
      const userExists = await User.findById(progress.user);
      
      if (!courseExists || !userExists) {
        await UserProgress.findByIdAndDelete(progress._id);
        orphanedProgress++;
      }
    }
    
    if (orphanedProgress > 0) {
      console.log(`   ✅ Removed ${orphanedProgress} orphaned progress records`);
      totalCleaned += orphanedProgress;
    } else {
      console.log(`   ✓  No orphaned progress records found`);
    }

    // 4. Summary
    console.log('\n' + '='.repeat(50));
    if (totalCleaned > 0) {
      console.log(`🎉 Cleanup complete! Removed ${totalCleaned} orphaned records`);
    } else {
      console.log('✅ Database is clean! No orphaned data found');
    }
    console.log('='.repeat(50) + '\n');

  } catch (error) {
    console.error('❌ Cleanup failed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Disconnected from MongoDB\n');
  }
}

cleanupOrphanedData();
