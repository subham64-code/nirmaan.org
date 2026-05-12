const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdfParse = require('pdf-parse');
const fs = require('fs');
const path = require('path');
const auth = require('../middleware/auth');
const Question = require('../models/Question');

// Auth middleware for teacher role
const authenticate = auth(['teacher', 'admin']);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/documents');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOCX, and TXT are allowed.'));
    }
  }
});

// Helper function to extract text from PDF
async function extractPdfText(filePath) {
  const buffer = fs.readFileSync(filePath);
  const data = await pdfParse(buffer);
  return data.text;
}

// Helper function to extract text from DOCX (simplified)
async function extractDocxText(filePath) {
  // For simple DOCX parsing, read XML content
  // A more robust solution would use docx-parser or mammoth library
  // For now, return placeholder - can be enhanced
  try {
    const DocxParser = require('docx-parser');
    const parser = new DocxParser();
    const doc = await parser.parseFile(filePath);
    return doc.getFullText();
  } catch (e) {
    console.log('Docx parsing fallback');
    return '';
  }
}

// Helper to parse extracted text into questions using pattern matching
function parseQuestionsFromText(text) {
  const lines = text.split('\n').filter(line => line.trim());
  const questions = [];
  let currentQuestion = null;
  
  // Pattern: look for numbered questions (1., 2., Q1:, Question 1:, etc)
  const questionPattern = /^(\d+[\.\)]|Q\d+:|Question\s+\d+:|\*\*\d+\.\*\*)\s+(.+)$/i;
  const optionPattern = /^([A\-D]|[a\-d]|Option\s+[A\-D])\s*[\.\)]\s*(.+)$/i;
  const answerPattern = /^(Answer|Correct|Ans|Answer Key):\s*([A\-D]|[a\-d]|\d+)$/i;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    const qMatch = line.match(questionPattern);
    if (qMatch) {
      if (currentQuestion && currentQuestion.question) {
        questions.push(currentQuestion);
      }
      currentQuestion = {
        question: qMatch[2],
        options: [],
        correctAnswer: null,
        marks: 1
      };
      continue;
    }
    
    if (currentQuestion) {
      const oMatch = line.match(optionPattern);
      if (oMatch) {
        currentQuestion.options.push({
          label: oMatch[1].toUpperCase().charAt(0),
          text: oMatch[2]
        });
      } else if (line.match(answerPattern)) {
        const aMatch = line.match(answerPattern);
        currentQuestion.correctAnswer = aMatch[2].toUpperCase().charAt(0);
      }
    }
  }
  
  if (currentQuestion && currentQuestion.question) {
    questions.push(currentQuestion);
  }
  
  return questions.filter(q => q.question && q.options.length >= 2);
}

// POST /api/questions/extract - Extract questions from uploaded document
router.post('/extract', authenticate, upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const fileExt = path.extname(req.file.originalname).toLowerCase();
    let extractedText = '';

    // Extract text based on file type
    if (fileExt === '.pdf') {
      extractedText = await extractPdfText(filePath);
    } else if (fileExt === '.docx') {
      extractedText = await extractDocxText(filePath);
    } else if (fileExt === '.txt') {
      extractedText = fs.readFileSync(filePath, 'utf-8');
    }

    // Parse questions from extracted text
    const questions = parseQuestionsFromText(extractedText);

    // Clean up uploaded file
    fs.unlinkSync(filePath);

    res.json({
      success: true,
      questionsExtracted: questions.length,
      questions: questions.map(q => ({
        question: q.question,
        options: q.options.map(opt => opt.text),
        correctAnswer: q.correctAnswer || 'A',
        marks: q.marks
      }))
    });

  } catch (error) {
    console.error('Question extraction error:', error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: 'Failed to extract questions: ' + error.message });
  }
});

// GET /api/questions - List all questions for teacher
router.get('/', authenticate, async (req, res) => {
  try {
    const questions = await Question.find({ teacherId: req.user._id }).sort({ createdAt: -1 });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

// POST /api/questions - Create question manually
router.post('/', authenticate, async (req, res) => {
  try {
    const { question, options, correctAnswer, marks, category, difficulty } = req.body;

    if (!question || !options || !correctAnswer) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newQuestion = new Question({
      teacherId: req.user._id,
      question,
      options,
      correctAnswer,
      marks: marks || 1,
      category: category || 'General',
      difficulty: difficulty || 'Medium'
    });

    await newQuestion.save();
    res.status(201).json(newQuestion);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create question' });
  }
});

// DELETE /api/questions/:id - Delete a question
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    if (question.teacherId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized to delete this question' });
    }

    await Question.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete question' });
  }
});

module.exports = router;
