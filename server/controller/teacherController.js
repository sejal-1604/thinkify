import AssignmentModel from '../models/assignmentSchema.js';
import PollModel from '../models/pollSchema.js';
import UserModel from '../models/userSchema.js';

// Teacher Dashboard
export const getTeacherDashboard = async (req, res) => {
    try {
        const teacherId = req.teacher._id;
        
        // Get teacher's assignments count
        const assignmentsCount = await AssignmentModel.countDocuments({ createdBy: teacherId });
        const activeAssignments = await AssignmentModel.countDocuments({ 
            createdBy: teacherId, 
            status: 'active' 
        });
        
        // Get teacher's polls count
        const pollsCount = await PollModel.countDocuments({ createdBy: teacherId });
        const activePolls = await PollModel.countDocuments({ 
            createdBy: teacherId, 
            status: 'active' 
        });
        
        // Get recent assignments
        const recentAssignments = await AssignmentModel.find({ createdBy: teacherId })
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('submissions.student', 'fullName email');
        
        // Get recent polls
        const recentPolls = await PollModel.find({ createdBy: teacherId })
            .sort({ createdAt: -1 })
            .limit(5);
        
        // Get students count (approximate - all students in the system)
        const studentsCount = await UserModel.countDocuments({ role: 'student' });
        
        const dashboardData = {
            teacher: {
                name: req.teacher.fullName,
                email: req.teacher.email,
                department: req.teacher.department
            },
            stats: {
                totalAssignments: assignmentsCount,
                activeAssignments,
                totalPolls: pollsCount,
                activePolls,
                studentsCount
            },
            recentAssignments,
            recentPolls
        };
        
        res.status(200).json({
            status: true,
            message: "Teacher dashboard data retrieved successfully",
            data: dashboardData
        });
        
    } catch (error) {
        console.error('Teacher dashboard error:', error);
        res.status(500).json({
            status: false,
            message: "Internal Server Error",
            error: process.env.NODE_ENV === 'development' ? error.message : 'Failed to load dashboard'
        });
    }
};

// Assignment Management
export const createAssignment = async (req, res) => {
    try {
        const {
            title,
            description,
            subject,
            deadline,
            totalMarks,
            audience,
            targetStudents,
            instructions,
            resources,
            allowLateSubmission,
            maxSubmissions
        } = req.body;
        
        const assignment = new AssignmentModel({
            title,
            description,
            subject,
            deadline: new Date(deadline),
            totalMarks,
            audience: audience || 'all',
            targetStudents: audience === 'specific' ? targetStudents : [],
            instructions,
            resources,
            allowLateSubmission: allowLateSubmission !== undefined ? allowLateSubmission : true,
            maxSubmissions: maxSubmissions || 1,
            createdBy: req.teacher._id
        });
        
        await assignment.save();
        
        res.status(201).json({
            status: true,
            message: "Assignment created successfully",
            data: assignment
        });
        
    } catch (error) {
        console.error('Create assignment error:', error);
        res.status(500).json({
            status: false,
            message: "Failed to create assignment",
            error: process.env.NODE_ENV === 'development' ? error.message : 'Assignment creation failed'
        });
    }
};

export const getTeacherAssignments = async (req, res) => {
    try {
        const { status } = req.query;
        const assignments = await AssignmentModel.getTeacherAssignments(req.teacher._id, status);
        
        res.status(200).json({
            status: true,
            message: "Assignments retrieved successfully",
            data: assignments
        });
        
    } catch (error) {
        console.error('Get teacher assignments error:', error);
        res.status(500).json({
            status: false,
            message: "Failed to retrieve assignments",
            error: process.env.NODE_ENV === 'development' ? error.message : 'Failed to load assignments'
        });
    }
};

export const getAssignmentById = async (req, res) => {
    try {
        const { assignmentId } = req.params;
        
        const assignment = await AssignmentModel.findOne({
            _id: assignmentId,
            createdBy: req.teacher._id
        }).populate('submissions.student', 'fullName email studentId');
        
        if (!assignment) {
            return res.status(404).json({
                status: false,
                message: "Assignment not found"
            });
        }
        
        res.status(200).json({
            status: true,
            message: "Assignment retrieved successfully",
            data: assignment
        });
        
    } catch (error) {
        console.error('Get assignment error:', error);
        res.status(500).json({
            status: false,
            message: "Failed to retrieve assignment",
            error: process.env.NODE_ENV === 'development' ? error.message : 'Failed to load assignment'
        });
    }
};

export const gradeAssignment = async (req, res) => {
    try {
        const { assignmentId, studentId } = req.params;
        const { marks, feedback } = req.body;
        
        const assignment = await AssignmentModel.findOne({
            _id: assignmentId,
            createdBy: req.teacher._id
        });
        
        if (!assignment) {
            return res.status(404).json({
                status: false,
                message: "Assignment not found"
            });
        }
        
        const submission = assignment.submissions.find(
            sub => sub.student.toString() === studentId
        );
        
        if (!submission) {
            return res.status(404).json({
                status: false,
                message: "Submission not found"
            });
        }
        
        submission.marks = marks;
        submission.feedback = feedback;
        submission.gradedAt = new Date();
        submission.gradedBy = req.teacher._id;
        
        await assignment.save();
        
        res.status(200).json({
            status: true,
            message: "Assignment graded successfully",
            data: submission
        });
        
    } catch (error) {
        console.error('Grade assignment error:', error);
        res.status(500).json({
            status: false,
            message: "Failed to grade assignment",
            error: process.env.NODE_ENV === 'development' ? error.message : 'Grading failed'
        });
    }
};

// Poll Management
export const createPoll = async (req, res) => {
    try {
        const {
            title,
            description,
            type,
            options,
            deadline,
            isAnonymous,
            audience,
            targetUsers,
            showResults,
            allowMultipleVotes,
            maxVotesPerUser,
            category,
            tags
        } = req.body;
        
        const poll = new PollModel({
            title,
            description,
            type: type || 'single',
            options: options.map(option => ({ text: option, votes: 0, voters: [] })),
            deadline: new Date(deadline),
            isAnonymous: isAnonymous || false,
            audience: audience || 'all',
            targetUsers: audience === 'specific' ? targetUsers : [],
            showResults: showResults || 'after_vote',
            allowMultipleVotes: allowMultipleVotes || false,
            maxVotesPerUser: maxVotesPerUser || 1,
            category,
            tags,
            createdBy: req.teacher._id
        });
        
        await poll.save();
        
        res.status(201).json({
            status: true,
            message: "Poll created successfully",
            data: poll
        });
        
    } catch (error) {
        console.error('Create poll error:', error);
        res.status(500).json({
            status: false,
            message: "Failed to create poll",
            error: process.env.NODE_ENV === 'development' ? error.message : 'Poll creation failed'
        });
    }
};

export const getTeacherPolls = async (req, res) => {
    try {
        const { status } = req.query;
        const polls = await PollModel.getTeacherPolls(req.teacher._id, status);
        
        res.status(200).json({
            status: true,
            message: "Polls retrieved successfully",
            data: polls
        });
        
    } catch (error) {
        console.error('Get teacher polls error:', error);
        res.status(500).json({
            status: false,
            message: "Failed to retrieve polls",
            error: process.env.NODE_ENV === 'development' ? error.message : 'Failed to load polls'
        });
    }
};

export const getPollById = async (req, res) => {
    try {
        const { pollId } = req.params;
        
        const poll = await PollModel.findOne({
            _id: pollId,
            createdBy: req.teacher._id
        }).populate('voters.user', 'fullName email');
        
        if (!poll) {
            return res.status(404).json({
                status: false,
                message: "Poll not found"
            });
        }
        
        const results = poll.getResults();
        
        res.status(200).json({
            status: true,
            message: "Poll retrieved successfully",
            data: {
                poll,
                results
            }
        });
        
    } catch (error) {
        console.error('Get poll error:', error);
        res.status(500).json({
            status: false,
            message: "Failed to retrieve poll",
            error: process.env.NODE_ENV === 'development' ? error.message : 'Failed to load poll'
        });
    }
};

// Student Management
export const getStudents = async (req, res) => {
    try {
        const students = await UserModel.find({ role: 'student' })
            .select('fullName email studentId createdAt')
            .sort({ fullName: 1 });
        
        res.status(200).json({
            status: true,
            message: "Students retrieved successfully",
            data: students
        });
        
    } catch (error) {
        console.error('Get students error:', error);
        res.status(500).json({
            status: false,
            message: "Failed to retrieve students",
            error: process.env.NODE_ENV === 'development' ? error.message : 'Failed to load students'
        });
    }
};
