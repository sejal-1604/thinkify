import mongoose from 'mongoose';
import UserModel from '../models/userSchema.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const migrateUserRoles = async () => {
  try {
    console.log('🚀 Starting role migration...');
    
    // Connect to database
    const dbUrl = process.env.DATABASE_URL + process.env.DATABASE_NAME;
    await mongoose.connect(dbUrl);
    console.log('✅ Connected to database');

    // Check current user distribution
    const userCount = await UserModel.countDocuments({ role: "user" });
    const adminCount = await UserModel.countDocuments({ role: "admin" });
    
    console.log(`📊 Current role distribution:`);
    console.log(`   - Users with 'user' role: ${userCount}`);
    console.log(`   - Users with 'admin' role: ${adminCount}`);

    if (userCount === 0) {
      console.log('ℹ️  No users with "user" role found. Migration not needed.');
      process.exit(0);
    }

    // Create backup of current state (optional - for safety)
    console.log('💾 Creating backup of user data...');
    const allUsers = await UserModel.find({}).select('_id fullName email role');
    console.log(`   - Backed up ${allUsers.length} user records`);

    // Perform the migration
    console.log('🔄 Migrating "user" role to "student" role...');
    const result = await UserModel.updateMany(
      { role: "user" },
      { 
        $set: { 
          role: "student",
          updatedAt: new Date(),
          permissions: ['read_posts', 'create_posts', 'manage_tasks', 'submit_assignments', 'participate_polls']
        }
      }
    );

    console.log(`✅ Migration completed successfully!`);
    console.log(`   - Modified ${result.modifiedCount} user records`);
    console.log(`   - Matched ${result.matchedCount} user records`);

    // Verify migration
    const newStudentCount = await UserModel.countDocuments({ role: "student" });
    const remainingUserCount = await UserModel.countDocuments({ role: "user" });
    
    console.log('🔍 Post-migration verification:');
    console.log(`   - Users with 'student' role: ${newStudentCount}`);
    console.log(`   - Users with 'user' role: ${remainingUserCount}`);
    console.log(`   - Users with 'admin' role: ${adminCount}`);

    if (remainingUserCount === 0 && newStudentCount === userCount) {
      console.log('✅ Migration verification successful!');
    } else {
      console.log('⚠️  Migration verification failed. Please check manually.');
    }

    await mongoose.disconnect();
    console.log('🏁 Migration process completed');
    process.exit(0);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.error('Stack trace:', error.stack);
    
    try {
      await mongoose.disconnect();
    } catch (disconnectError) {
      console.error('Failed to disconnect from database:', disconnectError);
    }
    
    process.exit(1);
  }
};

// Rollback function (in case we need to revert)
const rollbackMigration = async () => {
  try {
    console.log('🔄 Rolling back migration...');
    
    const dbUrl = process.env.DATABASE_URL + process.env.DATABASE_NAME;
    await mongoose.connect(dbUrl);
    
    const result = await UserModel.updateMany(
      { role: "student" },
      { 
        $set: { 
          role: "user",
          updatedAt: new Date()
        },
        $unset: {
          permissions: "",
          studentId: "",
          teacherId: "",
          department: ""
        }
      }
    );

    console.log(`✅ Rollback completed. Reverted ${result.modifiedCount} records`);
    await mongoose.disconnect();
    process.exit(0);

  } catch (error) {
    console.error('❌ Rollback failed:', error);
    process.exit(1);
  }
};

// Check command line arguments
const args = process.argv.slice(2);
if (args.includes('--rollback')) {
  rollbackMigration();
} else {
  migrateUserRoles();
}
