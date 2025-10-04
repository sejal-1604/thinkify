import express from 'express';
import teacherAuthentication from '../middleware/teacherAuthentication.js';
import roleBasedAuth, { teacherOrAdmin } from '../middleware/roleBasedAuth.js';
import {
    getTeacherDashboard,
    createAssignment,
    getTeacherAssignments,
    getAssignmentById,
    gradeAssignment,
    createPoll,
    getTeacherPolls,
    getPollById,
    getStudents
} from '../controller/teacherController.js';

const router = express.Router();

// Teacher Dashboard
router.get('/dashboard', teacherAuthentication, getTeacherDashboard);

// Assignment Routes
router.post('/assignments', teacherAuthentication, createAssignment);
router.get('/assignments', teacherAuthentication, getTeacherAssignments);
router.get('/assignments/:assignmentId', teacherAuthentication, getAssignmentById);
router.put('/assignments/:assignmentId/grade/:studentId', teacherAuthentication, gradeAssignment);

// Poll Routes
router.post('/polls', teacherAuthentication, createPoll);
router.get('/polls', teacherAuthentication, getTeacherPolls);
router.get('/polls/:pollId', teacherAuthentication, getPollById);

// Student Management Routes
router.get('/students', teacherAuthentication, getStudents);

// Alternative routes using flexible role-based auth (teacher or admin can access)
router.get('/dashboard-alt', teacherOrAdmin(), getTeacherDashboard);
router.post('/assignments-alt', teacherOrAdmin(), createAssignment);
router.post('/polls-alt', teacherOrAdmin(), createPoll);

export default router;
