import mongoose from 'mongoose';

const pollSchema = new mongoose.Schema({
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
    maxlength: 1000
  },
  type: {
    type: String,
    enum: ['single', 'multiple'],
    required: true,
    default: 'single'
  },
  options: [{
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    votes: {
      type: Number,
      default: 0,
      min: 0
    },
    voters: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  }],
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
  isAnonymous: {
    type: Boolean,
    default: false
  },
  audience: {
    type: String,
    enum: ['all', 'students', 'teachers', 'specific'],
    default: 'all'
  },
  // If audience is 'specific', specify target users
  targetUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Track all voters (for non-anonymous polls)
  voters: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    votedAt: {
      type: Date,
      default: Date.now
    },
    selectedOptions: [{
      type: Number, // Index of the selected option
      required: true
    }]
  }],
  status: {
    type: String,
    enum: ['active', 'completed', 'expired', 'draft'],
    default: 'active'
  },
  // Poll settings
  allowMultipleVotes: {
    type: Boolean,
    default: false
  },
  showResults: {
    type: String,
    enum: ['always', 'after_vote', 'after_deadline'],
    default: 'after_vote'
  },
  maxVotesPerUser: {
    type: Number,
    default: 1,
    min: 1
  },
  // Additional metadata
  category: {
    type: String,
    trim: true,
    maxlength: 50
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 30
  }],
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
pollSchema.index({ createdBy: 1, status: 1 });
pollSchema.index({ deadline: 1 });
pollSchema.index({ 'voters.user': 1 });
pollSchema.index({ audience: 1 });

// Virtual for checking if poll is expired
pollSchema.virtual('isExpired').get(function() {
  return new Date() > this.deadline;
});

// Virtual for getting total votes
pollSchema.virtual('totalVotes').get(function() {
  return this.options.reduce((total, option) => total + option.votes, 0);
});

// Virtual for getting unique voter count
pollSchema.virtual('uniqueVoterCount').get(function() {
  return this.voters.length;
});

// Pre-save middleware to update status based on deadline
pollSchema.pre('save', function(next) {
  if (this.deadline < new Date() && this.status === 'active') {
    this.status = 'expired';
  }
  this.updatedAt = new Date();
  next();
});

// Method to check if a user can vote
pollSchema.methods.canUserVote = function(userId) {
  if (this.status !== 'active' || this.isExpired) {
    return false;
  }
  
  const userVotes = this.voters.filter(
    voter => voter.user.toString() === userId.toString()
  );
  
  return userVotes.length < this.maxVotesPerUser;
};

// Method to get user's votes
pollSchema.methods.getUserVotes = function(userId) {
  return this.voters.filter(
    voter => voter.user.toString() === userId.toString()
  );
};

// Method to add a vote
pollSchema.methods.addVote = function(userId, optionIndexes) {
  if (!this.canUserVote(userId)) {
    throw new Error('User cannot vote on this poll');
  }
  
  // Validate option indexes
  const validIndexes = optionIndexes.filter(
    index => index >= 0 && index < this.options.length
  );
  
  if (validIndexes.length === 0) {
    throw new Error('Invalid option indexes');
  }
  
  // For single choice polls, only allow one option
  if (this.type === 'single' && validIndexes.length > 1) {
    throw new Error('Single choice polls allow only one option');
  }
  
  // Add vote to voters array
  this.voters.push({
    user: userId,
    selectedOptions: validIndexes,
    votedAt: new Date()
  });
  
  // Update vote counts for each option
  validIndexes.forEach(index => {
    this.options[index].votes += 1;
    if (!this.isAnonymous) {
      this.options[index].voters.push(userId);
    }
  });
  
  return this.save();
};

// Method to get poll results
pollSchema.methods.getResults = function(userId = null) {
  const results = {
    totalVotes: this.totalVotes,
    uniqueVoters: this.uniqueVoterCount,
    options: this.options.map(option => ({
      text: option.text,
      votes: option.votes,
      percentage: this.totalVotes > 0 ? ((option.votes / this.totalVotes) * 100).toFixed(1) : 0,
      voters: this.isAnonymous ? [] : option.voters
    }))
  };
  
  // Check if user can see results based on showResults setting
  if (userId && this.showResults === 'after_vote') {
    const hasVoted = this.voters.some(voter => voter.user.toString() === userId.toString());
    if (!hasVoted) {
      return { message: 'Vote first to see results' };
    }
  }
  
  if (this.showResults === 'after_deadline' && !this.isExpired) {
    return { message: 'Results will be available after deadline' };
  }
  
  return results;
};

// Static method to get polls for a teacher
pollSchema.statics.getTeacherPolls = function(teacherId, status = null) {
  const query = { createdBy: teacherId };
  if (status) {
    query.status = status;
  }
  return this.find(query).populate('voters.user', 'fullName email').sort({ createdAt: -1 });
};

// Static method to get polls for a user based on audience
pollSchema.statics.getUserPolls = function(userId, userRole) {
  const query = {
    status: { $in: ['active', 'expired'] },
    $or: [
      { audience: 'all' },
      { audience: userRole },
      { audience: 'specific', targetUsers: userId }
    ]
  };
  
  return this.find(query).populate('createdBy', 'fullName email').sort({ deadline: 1 });
};

// Static method to get active polls
pollSchema.statics.getActivePolls = function() {
  return this.find({
    status: 'active',
    deadline: { $gt: new Date() }
  }).populate('createdBy', 'fullName email').sort({ deadline: 1 });
};

const PollModel = mongoose.model('Poll', pollSchema);

export default PollModel;
