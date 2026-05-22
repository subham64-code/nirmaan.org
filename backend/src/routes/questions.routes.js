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
// Helper function to extract text from DOCX (simplified)
function extractDocxText(filePath) {
  return new Promise((resolve) => {
    try {
      const docxParser = require('docx-parser');
      docxParser.parseDocx(filePath, (data) => {
        resolve(data || '');
      });
    } catch (e) {
      console.error('Docx parser error, running basic string extraction:', e);
      try {
        // Fallback: try using mammoth for more robust DOCX extraction
        const mammoth = require('mammoth');
        mammoth.extractRawText({ path: filePath })
          .then(result => resolve(result.value || ''))
          .catch(mammothErr => {
            console.warn('Mammoth fallback failed, falling back to raw file read:', mammothErr);
            try {
              const fs = require('fs');
              const content = fs.readFileSync(filePath, 'utf-8');
              resolve(content || '');
            } catch (innerErr) {
              resolve('');
            }
          });
      } catch (innerErr) {
        resolve('');
      }
    }
  });
}

// Helper to parse extracted text into questions using pattern matching
function parseQuestionsFromText(text) {
  const lines = text.split('\n').filter(line => line.trim());
  const questions = [];
  let currentQuestion = null;
  
  // Patterns
  const questionPattern = /^(\d+[\.\)]|Q\d+:|Question\s+\d+:|\*\*\d+\.\*\*|\-\s+)\s*(.+)$/i;
  const optionPattern = /^([A\-F]|[a\-f]|Option\s+[A\-F])\s*[\.\)\-:]\s*(.+)$/i;
  const answerPattern = /^(Answer|Correct|Ans|Answer\s*Key|Key):\s*([A\-F]|[a\-f]|\d+)$/i;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Check if it's a question
    const qMatch = line.match(questionPattern);
    const isQuestionLine = qMatch || (line.endsWith('?') && line.length > 15 && !line.match(optionPattern));
    
    if (isQuestionLine) {
      if (currentQuestion && currentQuestion.question && currentQuestion.options.length >= 2) {
        questions.push(currentQuestion);
      }
      currentQuestion = {
        question: qMatch ? qMatch[2].trim() : line.trim(),
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
          text: oMatch[2].trim()
        });
      } else {
        const aMatch = line.match(answerPattern);
        if (aMatch) {
          currentQuestion.correctAnswer = aMatch[2].toUpperCase().charAt(0);
        } else if (line.length > 0 && currentQuestion.options.length < 4 && !line.startsWith('Question') && !line.startsWith('Q')) {
          currentQuestion.options.push({
            label: String.fromCharCode(65 + currentQuestion.options.length),
            text: line.trim()
          });
        }
      }
    }
  }
  
  if (currentQuestion && currentQuestion.question && currentQuestion.options.length >= 2) {
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
    const ownerId = req.user.sub;
    const role = req.user.role;
    const query = role === "admin" ? {} : { teacherId: ownerId };
    const questions = await Question.find(query).sort({ createdAt: -1 });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

// GET /api/questions/predefined - Question bank for exam creation
router.get('/predefined', authenticate, async (req, res) => {
  try {
    const ownerId = req.user.sub;
    const role = req.user.role;
    const query = role === "admin" ? {} : { teacherId: ownerId };
    const questions = await Question.find(query)
      .select("question options correctAnswer marks category difficulty")
      .sort({ createdAt: -1 })
      .limit(300);

    res.json({
      success: true,
      data: questions,
      message: "Question bank loaded",
    });
  } catch (error) {
    console.error('Failed to fetch question bank:', error);
    res.json({
      success: true,
      data: [],
      message: 'Question bank loaded',
    });
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
      teacherId: req.user.sub,
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

    if (req.user.role !== "admin" && question.teacherId.toString() !== String(req.user.sub)) {
      return res.status(403).json({ error: 'Unauthorized to delete this question' });
    }

    await Question.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete question' });
  }
});

module.exports = router;
