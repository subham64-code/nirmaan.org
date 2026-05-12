const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    // Basic Info
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    aadhaar: { type: String, required: true, trim: true },
    dateOfBirth: { type: String, required: true },
    age: { type: Number, required: true },
    qualification: { type: String, required: true },
    maritalStatus: { type: String, enum: ["Single", "Married", "Divorced", "Widowed"], required: true },
    occupation: { type: String, required: true },
    languages: { type: String, required: true },
    category: { type: String, enum: ["General", "OBC", "SC", "ST"], required: true },
    preTrainingStatus: { type: String },
    course: {
      type: String,
      enum: ["AI/ML", "Deep Learning", "NLP", "Generative AI", "Soft Skills"],
      required: true,
    },
    
    // Education Details
    highestQualification: { type: String, required: true },
    groupSubjects: { type: String },
    educationStatus: { type: String, enum: ["Pass", "Fail", "Discontinued", "Pursuing"], required: true },
    yearOfCompletion: { type: String },
    percentage: { type: String },
    
    // College Details (if pursuing)
    collegeName: { type: String },
    collegeTimings: { type: String },
    
    // If Fail/Discontinued
    reasonForNotCompleting: { type: String },
    
    // Technical Skills
    technicalSkills: { type: String, required: true },
    
    // Work Experience
    hasWorkExperience: { type: String, enum: ["Yes", "No"], required: true },
    workExperience: { type: Array },
    jobChallenges: { type: String },
    
    // Job Preference
    preferredJob: { type: String, enum: ["Government", "Private"], required: true },
    interestedSectors: { type: String },
    govtJobTraining: { type: String },
    specialTrainingNeeded: { type: String },
    
    // Future Ready
    futureReadyInterest: { type: String, enum: ["Job", "Further Studies"], required: true },
    whyThisCourse: { type: String, required: true },
    jobType: { type: String },
    preferredLocations: { type: String },
    ambition: { type: String },
    futureMeaning: { type: String, enum: ["Enthusiasm", "Scary", "Very Scary"], required: true },
    futureEnthusiasm: { type: String },
    
    // Extracurricular
    extracurricular: { type: Array },
    otherActivity: { type: String },
    
    // Photo
    photo: { type: String },
    
    // Legacy fields for backward compatibility
    tenthMarks: { type: Number },
    twelfthMarks: { type: Number },
    degreeMarks: { type: Number },
    
    // Status
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },
    remarks: { type: String, default: "" },
    agreedToTerms: { type: Boolean, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Application", applicationSchema);
