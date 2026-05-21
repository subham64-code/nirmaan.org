export const courses = [
  {
    title: "AI/ML",
    duration: "24 Weeks",
    description: "Build models, deploy ML pipelines, and solve real-world AI problems.",
    skills: ["Python", "ML Ops", "Feature Engineering", "Model Evaluation"],
    placement: "Mock interviews, portfolio support, and industry referrals.",
  },
  {
    title: "Deep Learning",
    duration: "20 Weeks",
    description: "Master CNNs, RNNs, transformers, and practical DL model training.",
    skills: ["PyTorch", "TensorFlow", "Computer Vision", "Sequence Models"],
    placement: "Project showcase and mentor-led hiring preparation.",
  },
  {
    title: "NLP",
    duration: "16 Weeks",
    description: "Learn language understanding, embeddings, and production NLP systems.",
    skills: ["Tokenization", "Embeddings", "Transformer Fine-tuning", "Evaluation"],
    placement: "NLP domain interview preparation and capstone guidance.",
  },
  {
    title: "Generative AI",
    duration: "16 Weeks",
    description: "Build GenAI products with LLMs, RAG, agents, and safety guardrails.",
    skills: ["Prompt Engineering", "RAG", "LangChain", "AI Safety"],
    placement: "Startup projects and product-focused portfolio building.",
  },
  {
    title: "Soft Skills",
    duration: "8 Weeks",
    description: "Improve communication, teamwork, and interview confidence.",
    skills: ["Communication", "Presentation", "Group Discussion", "Interview Skills"],
    placement: "Personal branding and recruiter-facing readiness program.",
  },
] as const;

export const trainerProfiles = [
  {
    name: "Mr. Krishan Kumar",
    expertise: "Soft Skills Trainer",
    image: "/trainer-krishan.jpg",
    video: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    bio: "Expert in communication skills and personality development with 10+ years of experience in corporate training."
  },
  {
    name: "Mr. Stithikantha Mohanty",
    expertise: "Soft Skills Trainer",
    image: "/trainer-stithikantha.jpg",
    video: "https://www.youtube.com/embed/jNQXAC9IVRw",
    bio: "Specialized in behavioral training and leadership development, helping students build confidence and professional skills."
  },
  {
    name: "Mr. Mihir Pattanaik",
    expertise: "AI Master Trainer",
    image: "/trainer-mihir.png",
    video: "https://www.youtube.com/embed/9bZkp7q19f0",
    bio: "AI expert with deep knowledge in machine learning, deep learning, and practical AI implementations."
  },
  {
    name: "Mr. Kalpa Pandit",
    expertise: "AI Master Trainer",
    image: "/trainer-kalpa.jpg",
    video: "https://www.youtube.com/embed/3tmd-ClpJxA",
    bio: "Seasoned AI professional specializing in NLP, computer vision, and cutting-edge AI technologies."
  },
  {
    name: "Mr. Placement Coordinator",
    expertise: "Placement & Career Development",
    image: "/trainer-placement.jpg",
    video: "https://www.youtube.com/embed/yxW3cGq7K7U",
    bio: "Dedicated to student success with expertise in resume building, interview preparation, and industry connections."
  },
];

export const backgroundVideoUrl =
  process.env.NEXT_PUBLIC_BACKGROUND_VIDEO_URL ||
  "https://www.youtube.com/embed/-TO3mgStyZY?autoplay=1&mute=1&loop=1&playlist=-TO3mgStyZY&controls=0&modestbranding=1&rel=0&playsinline=1";

export const proctoringLaunchUrl =
  process.env.NEXT_PUBLIC_PROCTORING_URL ||
  "http://127.0.0.1:5001/proctoring-launch";

export const dailyAttendanceReportUrl =
  process.env.NEXT_PUBLIC_ATTENDANCE_REPORT_URL ||
  "https://docs.google.com/spreadsheets/d/1D4JBxZLZSHmXhrhLIX-JBrKmPhkpZ2MJX8k0Y6JNY04/edit?gid=905174869#gid=905174869";

export const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
export const googleOauthClientId = process.env.NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID || "";
export const geminiApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
export const deepseekApiKey = process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY || "";
export const ollamaApiKey = process.env.NEXT_PUBLIC_OLLAMA_API_KEY || "";
export const sendGridApiKeyNode = process.env.SENDGRID_API_KEY_NODE || "";
export const sendGridApiKeyPython = process.env.SENDGRID_API_KEY_PYTHON || "";

export const nirmaanMapEmbedUrl = googleMapsApiKey
  ? `https://www.google.com/maps/embed/v1/place?key=${googleMapsApiKey}&q=${encodeURIComponent("Nirmaan, Bhubaneswar, Odisha")}`
  : "https://www.google.com/maps?q=Nirmaan%20Bhubaneswar%20Odisha&output=embed";

export const adminProfile = {
  name: "Pratyush Ratha",
  role: "Admin Manager",
  image: "/admin-manager.jpg",
  bio: "Leads administration, verification, approvals, and operational quality for all training and placement workflows."
};

export const galleryImages = [
  "/gallery-inauguration.png",
  "/gallery-students.jpg",
  "/gallery-office.jpg",
  "/gallery-youth.jpg",
  "/gallery-labour.jpg",
  "/gallery-activity.png",
  "/gallery-office.jpg",
  "/gallery-inauguration.png",
  "/gallery-event-1.jpg",
  "/gallery-event-2.jpg",
  "/gallery-event-3.jpg",
  "/gallery-event-4.jpg",
  "/gallery-event-5.jpg",
  "/gallery-event-6.jpg",
  "/gallery-event-7.jpg",
  "/gallery-event-8.jpg",
  "/gallery-event-9.jpg",
  "/gallery-event-10.jpg"
];

export const inaugurationVideos = [
  {
    title: "Nirmaan Inauguration Ceremony",
    embedUrl: "https://www.youtube.com/embed/-TO3mgStyZY",
    description: "Official inauguration of Nirmaan AI training center"
  },
  {
    title: "About Nirmaan",
    embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    description: "Learn about Nirmaan's mission and vision"
  },
  {
    title: "Student Testimonials",
    embedUrl: "https://www.youtube.com/embed/jNQXAC9IVRw",
    description: "Hear from our successful students about their experience"
  },
  {
    title: "Smart Lab Tour",
    embedUrl: "https://www.youtube.com/embed/9bZkp7q19f0",
    description: "Take a virtual tour of our state-of-the-art AI lab"
  }
];
