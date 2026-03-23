# EduX Platform Database Scripts

This folder contains utility scripts for managing your MongoDB database, migrating data, and fixing common issues.

## 📋 Available Scripts

### 1. 🔍 diagnose.js
**Purpose:** Check your database connection and configuration

**Usage:**
```bash
node scripts/diagnose.js
```

**What it does:**
- Checks environment variables
- Tests MongoDB connection
- Shows database statistics
- Lists user roles and educators
- Identifies configuration issues
- Provides recommendations

**When to use:**
- Before migration
- After deployment
- When troubleshooting issues
- To verify setup

---

### 2. 📤 exportLocalData.js
**Purpose:** Export all data from local MongoDB to JSON files

**Usage:**
```bash
node scripts/exportLocalData.js
```

**What it does:**
- Connects to local MongoDB (127.0.0.1:27017)
- Exports all collections to JSON files
- Saves to `backend/data-export/` folder
- Shows export statistics

**When to use:**
- Before migrating to Atlas
- For backup purposes
- Before major changes

**Output:**
- Creates `data-export/` folder
- One JSON file per collection
- Preserves all data and relationships

---

### 3. 📥 importToAtlas.js
**Purpose:** Import exported data to MongoDB Atlas

**Usage:**
```bash
node scripts/importToAtlas.js
```

**Prerequisites:**
- Run `exportLocalData.js` first
- Update `.env` with Atlas connection string
- Configure Atlas IP whitelist

**What it does:**
- Connects to MongoDB Atlas
- Imports all JSON files from `data-export/`
- Handles duplicate keys gracefully
- Preserves user passwords (already hashed)
- Shows import statistics

**When to use:**
- After exporting local data
- When setting up Atlas for first time
- To restore from backup

---

### 4. 🔧 fixUserRoles.js
**Purpose:** Fix user roles and onboarding status for all users

**Usage:**
```bash
node scripts/fixUserRoles.js
```

**What it does:**
- Connects to your database (local or Atlas)
- Fixes missing or invalid roles
- Sets default role to STUDENT
- Generates usernames if missing
- Sets onboarding status
- Shows statistics

**When to use:**
- After importing data
- When users can't create courses
- After database migration
- To fix "Access denied" errors

---

### 5. ⚡ quickFixAtlas.js
**Purpose:** Quickly fix a specific user's role and configuration

**Usage:**
```bash
node scripts/quickFixAtlas.js your-email@example.com
```

**What it does:**
- Finds user by email
- Sets role to EDUCATOR
- Generates username if missing
- Marks user as onboarded
- Shows before/after status

**When to use:**
- To quickly make yourself an educator
- When you need immediate access
- For testing purposes
- To fix a specific user

**Example:**
```bash
node scripts/quickFixAtlas.js john@example.com
```

---

### 6. 🌱 seedData.js
**Purpose:** Seed the database with sample data for testing

**Usage:**
```bash
node scripts/seedData.js
```

**What it does:**
- Creates sample users (students, educators, admin)
- Creates sample courses
- Sets up test data
- Useful for development

**When to use:**
- Setting up development environment
- Testing features
- Demo purposes

---

### 7. 📚 seedCourses.js
**Purpose:** Seed the database with sample courses

**Usage:**
```bash
node scripts/seedCourses.js
```

**What it does:**
- Creates sample courses with lessons
- Adds course content
- Sets up course structure

**When to use:**
- After seeding users
- For testing course features
- Demo purposes

---

## 🚀 Common Workflows

### Workflow 1: Migrate from Local to Atlas

```bash
# Step 1: Check current setup
node scripts/diagnose.js

# Step 2: Export local data
node scripts/exportLocalData.js

# Step 3: Update .env with Atlas connection string
# Edit backend/.env file

# Step 4: Import to Atlas
node scripts/importToAtlas.js

# Step 5: Fix user roles
node scripts/fixUserRoles.js

# Step 6: Verify
node scripts/diagnose.js
```

### Workflow 2: Fix "Access Denied" Error

```bash
# Option 1: Fix all users
node scripts/fixUserRoles.js

# Option 2: Fix specific user
node scripts/quickFixAtlas.js your-email@example.com

# Verify
node scripts/diagnose.js
```

### Workflow 3: Fresh Setup

```bash
# Step 1: Check connection
node scripts/diagnose.js

# Step 2: Seed sample data
node scripts/seedData.js
node scripts/seedCourses.js

# Step 3: Make yourself an educator
node scripts/quickFixAtlas.js your-email@example.com
```

### Workflow 4: Backup and Restore

```bash
# Backup
node scripts/exportLocalData.js

# Later, to restore
node scripts/importToAtlas.js
```

---

## 🔧 Troubleshooting

### Error: "Cannot connect to MongoDB"

**Solutions:**
1. Check `.env` file has correct `MONGODB_URI`
2. For Atlas: Verify IP whitelist (add 0.0.0.0/0)
3. Check database user credentials
4. Ensure cluster is not paused

### Error: "User not found"

**Solutions:**
1. Run `diagnose.js` to see available users
2. Check email spelling
3. Verify user exists in database

### Error: "Duplicate key error"

**Solutions:**
1. Data already exists in database
2. Use `--force` flag (if available)
3. Clear collection before importing

### Error: "Authentication failed"

**Solutions:**
1. Check database username and password
2. URL-encode special characters in password
3. Verify user has correct permissions

---

## 📝 Environment Variables

Make sure these are set in your `.env` file:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/edux_platform

# JWT Secret
JWT_SECRET=your_secret_key_here

# Client URL
CLIENT_URL=https://eduxai.xyz

# Node Environment
NODE_ENV=production
```

---

## 🎯 Best Practices

1. **Always backup before major changes**
   ```bash
   node scripts/exportLocalData.js
   ```

2. **Test on local first**
   - Use local MongoDB for testing
   - Migrate to Atlas when ready

3. **Run diagnostics regularly**
   ```bash
   node scripts/diagnose.js
   ```

4. **Keep data exports**
   - Don't delete `data-export/` folder
   - Useful for rollback

5. **Verify after changes**
   - Run diagnose after fixes
   - Test in browser

---

## 🆘 Need Help?

If scripts fail:

1. Check error message carefully
2. Run `diagnose.js` for insights
3. Verify environment variables
4. Check MongoDB Atlas dashboard
5. Review logs in Vercel

---

## 📚 Additional Resources

- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [Vercel Environment Variables](https://vercel.com/docs/environment-variables)
- [EduX Migration Guide](../ATLAS_MIGRATION_GUIDE.md)

---

**Happy coding!** 🚀
