export interface TrainingModule {
  id: string;
  title: string;
  description: string;
  duration: string;
  topics: string[];
  prerequisites: string[];
  learningObjectives: string[];
  assessmentType: string;
  order: number;
}

export interface TrainingPath {
  id: string;
  name: string;
  description: string;
  totalDuration: string;
  modules: TrainingModule[];
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  category: "AI/ML" | "Deep Learning" | "NLP" | "Generative AI" | "Soft Skills";
}

export class TrainingContentService {
  private static defaultPaths: TrainingPath[] = [
    {
      id: "ai-ml-foundation",
      name: "AI/ML Foundation",
      description: "Comprehensive introduction to Artificial Intelligence and Machine Learning fundamentals",
      totalDuration: "12 weeks",
      difficulty: "Beginner",
      category: "AI/ML",
      modules: [
        {
          id: "ai-intro",
          title: "Introduction to AI",
          description: "Understanding the basics of Artificial Intelligence, its history, and real-world applications",
          duration: "2 weeks",
          topics: [
            "What is AI and Machine Learning",
            "History and Evolution of AI",
            "Types of AI: Narrow, General, and Super AI",
            "Real-world AI Applications",
            "Ethics in AI"
          ],
          prerequisites: ["Basic computer skills", "High school mathematics"],
          learningObjectives: [
            "Define AI and its key concepts",
            "Identify different types of AI",
            "Understand AI applications in various industries",
            "Recognize ethical considerations in AI"
          ],
          assessmentType: "Quiz + Project",
          order: 1
        },
        {
          id: "ml-basics",
          title: "Machine Learning Basics",
          description: "Fundamental concepts of machine learning, algorithms, and model evaluation",
          duration: "3 weeks",
          topics: [
            "Supervised vs Unsupervised Learning",
            "Regression and Classification",
            "Basic Algorithms: Linear Regression, Decision Trees",
            "Model Evaluation Metrics",
            "Overfitting and Underfitting"
          ],
          prerequisites: ["Introduction to AI", "Basic statistics"],
          learningObjectives: [
            "Differentiate between supervised and unsupervised learning",
            "Implement basic ML algorithms",
            "Evaluate model performance",
            "Handle common ML challenges"
          ],
          assessmentType: "Coding Assignment + Quiz",
          order: 2
        },
        {
          id: "data-preprocessing",
          title: "Data Preprocessing and Feature Engineering",
          description: "Techniques for cleaning, transforming, and preparing data for ML models",
          duration: "2 weeks",
          topics: [
            "Data Cleaning Techniques",
            "Handling Missing Values",
            "Feature Selection and Extraction",
            "Data Normalization and Standardization",
            "Working with Different Data Types"
          ],
          prerequisites: ["Machine Learning Basics", "Basic Python"],
          learningObjectives: [
            "Clean and preprocess datasets",
            "Handle missing and noisy data",
            "Perform feature engineering",
            "Prepare data for ML models"
          ],
          assessmentType: "Practical Project",
          order: 3
        },
        {
          id: "python-ml",
          title: "Python for Machine Learning",
          description: "Python programming essentials and libraries for ML implementation",
          duration: "3 weeks",
          topics: [
            "Python Basics for Data Science",
            "NumPy and Pandas",
            "Matplotlib and Seaborn for Visualization",
            "Scikit-learn for ML",
            "Jupyter Notebooks"
          ],
          prerequisites: ["Basic programming knowledge"],
          learningObjectives: [
            "Use Python for data analysis",
            "Create visualizations",
            "Implement ML algorithms with scikit-learn",
            "Work with Jupyter notebooks"
          ],
          assessmentType: "Coding Exercises + Project",
          order: 4
        },
        {
          id: "capstone-project",
          title: "Foundation Capstone Project",
          description: "Complete machine learning project from data collection to model deployment",
          duration: "2 weeks",
          topics: [
            "Project Planning and Scoping",
            "Data Collection and Analysis",
            "Model Development and Training",
            "Evaluation and Optimization",
            "Results Presentation"
          ],
          prerequisites: ["All previous modules"],
          learningObjectives: [
            "Complete end-to-end ML project",
            "Apply all learned concepts",
            "Present project results effectively",
            "Document technical work"
          ],
          assessmentType: "Capstone Project + Presentation",
          order: 5
        }
      ]
    },
    {
      id: "deep-learning",
      name: "Deep Learning Specialization",
      description: "Advanced deep learning techniques and neural network architectures",
      totalDuration: "16 weeks",
      difficulty: "Advanced",
      category: "Deep Learning",
      modules: [
        {
          id: "neural-networks",
          title: "Neural Networks Fundamentals",
          description: "Introduction to neural networks, backpropagation, and deep learning basics",
          duration: "3 weeks",
          topics: [
            "Neural Network Architecture",
            "Activation Functions",
            "Backpropagation Algorithm",
            "Gradient Descent Optimization",
            "TensorFlow/PyTorch Basics"
          ],
          prerequisites: ["Machine Learning Basics", "Python proficiency", "Linear algebra"],
          learningObjectives: [
            "Understand neural network architecture",
            "Implement backpropagation",
            "Use deep learning frameworks",
            "Optimize neural network training"
          ],
          assessmentType: "Implementation Assignment + Quiz",
          order: 1
        },
        {
          id: "cnn",
          title: "Convolutional Neural Networks",
          description: "CNN architectures for computer vision tasks",
          duration: "4 weeks",
          topics: [
            "CNN Architecture Overview",
            "Convolution and Pooling Layers",
            "Popular CNN Models (LeNet, AlexNet, VGG, ResNet)",
            "Image Classification",
            "Object Detection Basics"
          ],
          prerequisites: ["Neural Networks Fundamentals"],
          learningObjectives: [
            "Design CNN architectures",
            "Implement image classification",
            "Understand transfer learning",
            "Apply CNNs to real problems"
          ],
          assessmentType: "Computer Vision Project",
          order: 2
        },
        {
          id: "rnn",
          title: "Recurrent Neural Networks",
          description: "RNN architectures for sequential data and time series",
          duration: "3 weeks",
          topics: [
            "RNN Architecture and Limitations",
            "LSTM and GRU Networks",
            "Sequence Prediction",
            "Time Series Analysis",
            "Natural Language Processing Basics"
          ],
          prerequisites: ["Neural Networks Fundamentals"],
          learningObjectives: [
            "Implement RNN architectures",
            "Work with sequential data",
            "Apply LSTMs to NLP tasks",
            "Handle time series data"
          ],
          assessmentType: "Sequential Data Project",
          order: 3
        },
        {
          id: "advanced-dl",
          title: "Advanced Deep Learning Topics",
          description: "Cutting-edge deep learning techniques and applications",
          duration: "4 weeks",
          topics: [
            "Transformer Architecture",
            "Attention Mechanisms",
            "Generative Models (GANs, VAEs)",
            "Reinforcement Learning Basics",
            "Model Deployment and Optimization"
          ],
          prerequisites: ["CNN", "RNN"],
          learningObjectives: [
            "Understand transformer architecture",
            "Implement generative models",
            "Apply reinforcement learning",
            "Deploy deep learning models"
          ],
          assessmentType: "Advanced Project + Research Paper",
          order: 4
        },
        {
          id: "dl-capstone",
          title: "Deep Learning Capstone",
          description: "Comprehensive deep learning project with real-world application",
          duration: "2 weeks",
          topics: [
            "Advanced Project Planning",
            "Model Architecture Design",
            "Training and Optimization",
            "Performance Evaluation",
            "Production Deployment"
          ],
          prerequisites: ["All deep learning modules"],
          learningObjectives: [
            "Design complex DL architectures",
            "Optimize model performance",
            "Deploy models to production",
            "Present advanced technical work"
          ],
          assessmentType: "Capstone Project + Deployment",
          order: 5
        }
      ]
    },
    {
      id: "nlp-specialization",
      name: "Natural Language Processing",
      description: "Comprehensive NLP techniques from text preprocessing to advanced language models",
      totalDuration: "14 weeks",
      difficulty: "Intermediate",
      category: "NLP",
      modules: [
        {
          id: "nlp-intro",
          title: "Introduction to NLP",
          description: "Fundamentals of natural language processing and text analysis",
          duration: "2 weeks",
          topics: [
            "NLP Overview and Applications",
            "Text Preprocessing Techniques",
            "Tokenization and Stemming",
            "Feature Extraction from Text",
            "Text Classification Basics"
          ],
          prerequisites: ["Python programming", "Basic ML knowledge"],
          learningObjectives: [
            "Understand NLP concepts",
            "Preprocess text data",
            "Extract features from text",
            "Build basic text classifiers"
          ],
          assessmentType: "Text Processing Assignment + Quiz",
          order: 1
        },
        {
          id: "text-representation",
          title: "Text Representation and Embeddings",
          description: "Advanced techniques for representing text numerically",
          duration: "3 weeks",
          topics: [
            "Bag of Words and TF-IDF",
            "Word Embeddings (Word2Vec, GloVe)",
            "Contextual Embeddings (BERT)",
            "Document Embeddings",
            "Similarity Measures"
          ],
          prerequisites: ["Introduction to NLP", "Linear algebra basics"],
          learningObjectives: [
            "Create text embeddings",
            "Use pre-trained language models",
            "Measure text similarity",
            "Apply embeddings to NLP tasks"
          ],
          assessmentType: "Embedding Project",
          order: 2
        },
        {
          id: "advanced-nlp",
          title: "Advanced NLP Applications",
          description: "Modern NLP applications and transformer models",
          duration: "4 weeks",
          topics: [
            "Transformer Architecture",
            "BERT and Fine-tuning",
            "Text Generation",
            "Named Entity Recognition",
            "Sentiment Analysis"
          ],
          prerequisites: ["Text Representation", "Deep Learning basics"],
          learningObjectives: [
            "Fine-tune transformer models",
            "Implement text generation",
            "Build NER systems",
            "Create sentiment analysis models"
          ],
          assessmentType: "NLP Application Project",
          order: 3
        },
        {
          id: "nlp-capstone",
          title: "NLP Capstone Project",
          description: "Complete NLP project with real-world application",
          duration: "2 weeks",
          topics: [
            "NLP Project Planning",
            "Data Collection and Processing",
            "Model Development",
            "Evaluation and Deployment",
            "Results Analysis"
          ],
          prerequisites: ["All NLP modules"],
          learningObjectives: [
            "Complete end-to-end NLP project",
            "Apply advanced NLP techniques",
            "Evaluate NLP model performance",
            "Deploy NLP applications"
          ],
          assessmentType: "Capstone Project + Presentation",
          order: 4
        }
      ]
    },
    {
      id: "generative-ai",
      name: "Generative AI",
      description: "Modern generative AI techniques including LLMs and image generation",
      totalDuration: "10 weeks",
      difficulty: "Advanced",
      category: "Generative AI",
      modules: [
        {
          id: "gen-ai-intro",
          title: "Introduction to Generative AI",
          description: "Overview of generative AI models and their applications",
          duration: "2 weeks",
          topics: [
            "Generative AI Overview",
            "Types of Generative Models",
            "Applications and Use Cases",
            "Ethical Considerations",
            "Model Evaluation Metrics"
          ],
          prerequisites: ["Deep Learning basics", "Python proficiency"],
          learningObjectives: [
            "Understand generative AI concepts",
            "Identify different model types",
            "Recognize ethical implications",
            "Evaluate generative models"
          ],
          assessmentType: "Research Assignment + Quiz",
          order: 1
        },
        {
          id: "llm",
          title: "Large Language Models",
          description: "Working with and fine-tuning large language models",
          duration: "3 weeks",
          topics: [
            "LLM Architecture Overview",
            "Prompt Engineering",
            "Fine-tuning Techniques",
            "Model Optimization",
            "API Integration"
          ],
          prerequisites: ["Introduction to Generative AI", "Deep Learning"],
          learningObjectives: [
            "Understand LLM architecture",
            "Design effective prompts",
            "Fine-tune language models",
            "Integrate LLM APIs"
          ],
          assessmentType: "LLM Project + Prompt Engineering",
          order: 2
        },
        {
          id: "image-generation",
          title: "Image Generation Models",
          description: "Text-to-image and image-to-image generation techniques",
          duration: "3 weeks",
          topics: [
            "GANs Fundamentals",
            "Diffusion Models",
            "Stable Diffusion",
            "Text-to-Image Generation",
            "Image Editing with AI"
          ],
          prerequisites: ["Introduction to Generative AI", "Computer Vision basics"],
          learningObjectives: [
            "Understand image generation models",
            "Use diffusion models",
            "Create text-to-image applications",
            "Implement image editing with AI"
          ],
          assessmentType: "Image Generation Project",
          order: 3
        },
        {
          id: "gen-ai-capstone",
          title: "Generative AI Capstone",
          description: "Comprehensive generative AI project",
          duration: "2 weeks",
          topics: [
            "Project Planning and Design",
            "Model Selection and Implementation",
            "User Interface Development",
            "Testing and Evaluation",
            "Deployment and Presentation"
          ],
          prerequisites: ["All Generative AI modules"],
          learningObjectives: [
            "Design generative AI applications",
            "Implement complete solutions",
            "Create user interfaces",
            "Deploy generative AI systems"
          ],
          assessmentType: "Capstone Project + Demo",
          order: 4
        }
      ]
    },
    {
      id: "soft-skills",
      name: "Professional Soft Skills",
      description: "Essential soft skills for career success in AI/ML industry",
      totalDuration: "8 weeks",
      difficulty: "Beginner",
      category: "Soft Skills",
      modules: [
        {
          id: "communication",
          title: "Communication Skills",
          description: "Effective communication for technical professionals",
          duration: "2 weeks",
          topics: [
            "Technical Communication",
            "Presentation Skills",
            "Written Communication",
            "Interpersonal Skills",
            "Cross-cultural Communication"
          ],
          prerequisites: ["Basic English proficiency"],
          learningObjectives: [
            "Communicate technical concepts clearly",
            "Deliver effective presentations",
            "Write professional documentation",
            "Work in diverse teams"
          ],
          assessmentType: "Presentation + Writing Assignment",
          order: 1
        },
        {
          id: "teamwork",
          title: "Teamwork and Collaboration",
          description: "Working effectively in teams and collaborative environments",
          duration: "2 weeks",
          topics: [
            "Team Dynamics",
            "Collaboration Tools",
            "Conflict Resolution",
            "Leadership Skills",
            "Project Management Basics"
          ],
          prerequisites: ["Communication Skills"],
          learningObjectives: [
            "Work effectively in teams",
            "Use collaboration tools",
            "Resolve conflicts constructively",
            "Demonstrate leadership qualities"
          ],
          assessmentType: "Group Project + Peer Review",
          order: 2
        },
        {
          id: "career-development",
          title: "Career Development",
          description: "Building a successful career in AI/ML",
          duration: "2 weeks",
          topics: [
            "Resume Building",
            "Interview Skills",
            "Networking",
            "Personal Branding",
            "Continuous Learning"
          ],
          prerequisites: ["Basic career awareness"],
          learningObjectives: [
            "Create professional resumes",
            "Excel in interviews",
            "Build professional networks",
            "Plan career growth"
          ],
          assessmentType: "Resume + Mock Interview",
          order: 3
        },
        {
          id: "business-acumen",
          title: "Business Acumen for AI Professionals",
          description: "Understanding business aspects of AI projects",
          duration: "2 weeks",
          topics: [
            "Business Strategy",
            "AI Project ROI",
            "Stakeholder Management",
            "Ethical AI in Business",
            "Innovation and Entrepreneurship"
          ],
          prerequisites: ["Basic business knowledge"],
          learningObjectives: [
            "Understand business strategy",
            "Evaluate AI project value",
            "Manage stakeholders effectively",
            "Apply AI ethically in business"
          ],
          assessmentType: "Business Case Study + Presentation",
          order: 4
        }
      ]
    }
  ];

  static getAllTrainingPaths(): TrainingPath[] {
    return this.defaultPaths;
  }

  static getTrainingPathById(id: string): TrainingPath | undefined {
    return this.defaultPaths.find(path => path.id === id);
  }

  static getTrainingPathsByCategory(category: string): TrainingPath[] {
    return this.defaultPaths.filter(path => path.category === category);
  }

  static getModuleById(pathId: string, moduleId: string): TrainingModule | undefined {
    const path = this.getTrainingPathById(pathId);
    return path?.modules.find(module => module.id === moduleId);
  }

  static getPrerequisitesForModule(pathId: string, moduleId: string): string[] {
    const module = this.getModuleById(pathId, moduleId);
    return module?.prerequisites || [];
  }

  static getLearningPathForStudent(interests: string[], skillLevel: string): TrainingPath[] {
    const suitablePaths = this.defaultPaths.filter(path => {
      const matchesInterest = interests.some(interest => 
        path.category.toLowerCase().includes(interest.toLowerCase())
      );
      const matchesSkill = this.matchesSkillLevel(path.difficulty, skillLevel);
      return matchesInterest && matchesSkill;
    });

    return suitablePaths;
  }

  private static matchesSkillLevel(pathDifficulty: string, studentLevel: string): boolean {
    const levelMapping = {
      "Beginner": ["Beginner"],
      "Intermediate": ["Beginner", "Intermediate"],
      "Advanced": ["Beginner", "Intermediate", "Advanced"]
    };

    return levelMapping[studentLevel as keyof typeof levelMapping]?.includes(pathDifficulty) || false;
  }

  static estimateTotalDuration(paths: TrainingPath[]): string {
    const totalWeeks = paths.reduce((total, path) => {
      const weeks = parseInt(path.totalDuration) || 0;
      return total + weeks;
    }, 0);

    return `${totalWeeks} weeks`;
  }
}
