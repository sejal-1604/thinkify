import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true,
    enum: ["student", "teacher", "admin"]
  },
  // Role-specific fields
  department: {
    type: String,
    required: function() { return this.role === 'teacher'; }
  },
  studentId: {
    type: String,
    required: function() { return this.role === 'student'; },
    unique: true,
    sparse: true // Allows null values to be non-unique
  },
  teacherId: {
    type: String,
    required: function() { return this.role === 'teacher'; },
    unique: true,
    sparse: true // Allows null values to be non-unique
  },
  // Permission system for fine-grained access control
  permissions: {
    type: [String],
    default: function() {
      switch(this.role) {
        case 'student': 
          return ['read_posts', 'create_posts', 'manage_tasks', 'submit_assignments', 'participate_polls'];
        case 'teacher': 
          return ['read_posts', 'create_posts', 'create_assignments', 'create_polls', 'manage_resources', 'grade_assignments'];
        case 'admin': 
          return ['all'];
        default: 
          return [];
      }
    }
  },
  image: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const UserModel = mongoose.model('User', userSchema);

export default UserModel
