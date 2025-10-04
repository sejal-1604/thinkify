import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  subject: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  deadline: {
    type: Date,
    required: true,
    validate: {
      validator: function(value) {
        return value > new Date();
      },
      message: 'Deadline must be in the future'
    }
  },
  totalMarks: {
    type: Number,
    required: true,
    min: 1,
    max: 1000
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'expired', 'draft'],
    default: 'active'
  },
  audience: {
    type: String,
    enum: ['all', 'specific'],
    default: 'all'
  },
  // If audience is 'specific', specify target students
  targetStudents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Assignment submissions from students
  submissions: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    submittedAt: {
      type: Date,
      default: Date.now
    },
    content: {
      type: String,
      required: true,
      maxlength: 5000
    },
    attachments: [{
      filename: String,
      originalName: String,
      mimetype: String,
      size: Number,
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }],
    marks: {
      type: Number,
      min: 0,
      validate: {
        validator: function(value) {
          return value <= this.parent().parent().totalMarks;
        },
        message: 'Marks cannot exceed total marks'
      }
    },
    feedback: {
      type: String,
      maxlength: 1000
    },
    gradedAt: Date,
    gradedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    isLate: {
      type: Boolean,
      default: false
    }
  }],
  // Assignment instructions and resources
  instructions: {
    type: String,
    maxlength: 3000
  },
  resources: [{
    title: String,
    url: String,
    type: {
      type: String,
      enum: ['link', 'file', 'video', 'document']
    }
  }],
  // Assignment settings
  allowLateSubmission: {
    type: Boolean,
    default: true
  },
  maxSubmissions: {
    type: Number,
    default: 1,
    min: 1
  },
  autoGrade: {
    type: Boolean,
    default: false
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

// Indexes for better query performance
assignmentSchema.index({ createdBy: 1, status: 1 });
assignmentSchema.index({ deadline: 1 });
assignmentSchema.index({ 'submissions.student': 1 });

// Virtual for checking if assignment is expired
assignmentSchema.virtual('isExpired').get(function() {
  return new Date() > this.deadline;
});

// Virtual for getting submission count
assignmentSchema.virtual('submissionCount').get(function() {
  return this.submissions.length;
});

// Pre-save middleware to update status based on deadline
assignmentSchema.pre('save', function(next) {
  if (this.deadline < new Date() && this.status === 'active') {
    this.status = 'expired';
  }
  this.updatedAt = new Date();
  next();
});

// Method to check if a student can submit
assignmentSchema.methods.canStudentSubmit = function(studentId) {
  const studentSubmissions = this.submissions.filter(
    sub => sub.student.toString() === studentId.toString()
  );
  
  return studentSubmissions.length < this.maxSubmissions && 
         (this.status === 'active' || (this.allowLateSubmission && this.status === 'expired'));
};

// Method to get student's submission
assignmentSchema.methods.getStudentSubmission = function(studentId) {
  return this.submissions.find(
    sub => sub.student.toString() === studentId.toString()
  );
};

// Static method to get assignments for a teacher
assignmentSchema.statics.getTeacherAssignments = function(teacherId, status = null) {
  const query = { createdBy: teacherId };
  if (status) {
    query.status = status;
  }
  return this.find(query).populate('submissions.student', 'fullName email').sort({ createdAt: -1 });
};

// Static method to get assignments for a student
assignmentSchema.statics.getStudentAssignments = function(studentId) {
  return this.find({
    $or: [
      { audience: 'all' },
      { audience: 'specific', targetStudents: studentId }
    ],
    status: { $in: ['active', 'expired'] }
  }).populate('createdBy', 'fullName email').sort({ deadline: 1 });
};

const AssignmentModel = mongoose.model('Assignment', assignmentSchema);

export default AssignmentModel;
