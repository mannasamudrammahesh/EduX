#!/bin/bash

# EduX Platform - MongoDB Atlas Migration Script
# This script automates the migration from local MongoDB to Atlas

echo "🚀 EduX Platform - MongoDB Atlas Migration"
echo "=========================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Navigate to backend directory
cd "$(dirname "$0")/backend" || exit 1

echo "📍 Current directory: $(pwd)"
echo ""

# Step 1: Diagnose current setup
echo "Step 1: Diagnosing current setup..."
echo "-----------------------------------"
node scripts/diagnose.js
if [ $? -ne 0 ]; then
    echo "❌ Diagnostic failed. Please check your local MongoDB connection."
    exit 1
fi
echo ""

# Step 2: Export local data
echo "Step 2: Exporting local data..."
echo "-----------------------------------"
read -p "Do you want to export local MongoDB data? (y/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    node scripts/exportLocalData.js
    if [ $? -ne 0 ]; then
        echo "❌ Export failed. Please check your local MongoDB."
        exit 1
    fi
else
    echo "⏭️  Skipping export..."
fi
echo ""

# Step 3: Update .env file
echo "Step 3: Update .env file"
echo "-----------------------------------"
echo "Please update your .env file with MongoDB Atlas connection string."
echo ""
echo "Example:"
echo "MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/edux_platform"
echo ""
read -p "Have you updated the .env file? (y/n): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "⏸️  Please update .env file and run this script again."
    exit 0
fi
echo ""

# Step 4: Import to Atlas
echo "Step 4: Importing data to Atlas..."
echo "-----------------------------------"
read -p "Do you want to import data to Atlas? (y/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    node scripts/importToAtlas.js
    if [ $? -ne 0 ]; then
        echo "❌ Import failed. Please check your Atlas connection."
        exit 1
    fi
else
    echo "⏭️  Skipping import..."
fi
echo ""

# Step 5: Fix user roles
echo "Step 5: Fixing user roles..."
echo "-----------------------------------"
read -p "Do you want to fix user roles? (y/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    node scripts/fixUserRoles.js
    if [ $? -ne 0 ]; then
        echo "⚠️  Role fix had some issues, but continuing..."
    fi
else
    echo "⏭️  Skipping role fix..."
fi
echo ""

# Step 6: Quick fix for specific user
echo "Step 6: Set yourself as educator (optional)"
echo "-----------------------------------"
read -p "Do you want to set a specific user as educator? (y/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "Enter your email address: " email
    node scripts/quickFixAtlas.js "$email"
fi
echo ""

# Step 7: Final diagnostic
echo "Step 7: Final verification..."
echo "-----------------------------------"
node scripts/diagnose.js
echo ""

# Summary
echo "✅ Migration process completed!"
echo ""
echo "📝 Next steps:"
echo "1. Update Vercel environment variables with Atlas connection string"
echo "2. Redeploy your application"
echo "3. Test login and course creation at https://eduxai.xyz"
echo ""
echo "📚 For detailed instructions, see: ATLAS_MIGRATION_GUIDE.md"
echo ""
