"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/lib/api";

const schema = z.object({
  // Basic Info
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(10, "Phone number is required"),
  aadhaar: z.string().min(12, "Aadhaar number is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  age: z.number().min(1, "Age is required"),
  qualification: z.string().min(2, "Qualification is required"),
  maritalStatus: z.enum(["Single", "Married", "Divorced", "Widowed"]),
  occupation: z.string().min(1, "Occupation is required"),
  languages: z.string().min(1, "Languages are required"),
  category: z.enum(["General", "OBC", "SC", "ST"]),
  preTrainingStatus: z.string().optional(),
  course: z.enum(["AI/ML", "Deep Learning", "NLP", "Generative AI", "Soft Skills"]),
  
  // Education Details
  highestQualification: z.string().min(1, "Highest qualification is required"),
  groupSubjects: z.string().optional(),
  educationStatus: z.enum(["Pass", "Fail", "Discontinued", "Pursuing"]),
  yearOfCompletion: z.string().optional(),
  percentage: z.string().optional(),
  
  // College Details (if pursuing)
  collegeName: z.string().optional(),
  collegeTimings: z.string().optional(),
  
  // If Fail/Discontinued
  reasonForNotCompleting: z.string().optional(),
  
  // Technical Skills
  technicalSkills: z.string().min(1, "Technical skills are required"),
  
  // Work Experience
  hasWorkExperience: z.enum(["Yes", "No"]),
  workExperience: z.array(z.object({
    organization: z.string(),
    from: z.string(),
    to: z.string(),
    designation: z.string(),
    salary: z.string(),
    reasonForLeaving: z.string()
  })).optional(),
  jobChallenges: z.string().optional(),
  
  // Job Preference
  preferredJob: z.enum(["Government", "Private"]),
  interestedSectors: z.string().optional(),
  govtJobTraining: z.string().optional(),
  specialTrainingNeeded: z.string().optional(),
  
  // Future Ready
  futureReadyInterest: z.enum(["Job", "Further Studies"]),
  whyThisCourse: z.string().min(10, "Please explain why you want to do this course"),
  jobType: z.string().optional(),
  preferredLocations: z.string().optional(),
  ambition: z.string().optional(),
  futureMeaning: z.enum(["Enthusiasm", "Scary", "Very Scary"]),
  futureEnthusiasm: z.string().optional(),
  
  // Extracurricular
  extracurricular: z.array(z.enum(["Sports", "Dance", "Music", "Drawing", "Other"])).optional(),
  otherActivity: z.string().optional(),
  
  // Declaration
  agreedToTerms: z.boolean().refine(Boolean, "You must agree to the declaration"),
  
  // Photo
  photo: z.any().optional()
});

type FormData = z.infer<typeof schema>;

export default function ApplyPage() {
  const [result, setResult] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [workExperienceCount, setWorkExperienceCount] = useState(0);
  const { register, handleSubmit, formState: { errors, isSubmitting }, watch } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { 
      course: "AI/ML", 
      agreedToTerms: false,
      hasWorkExperience: "No",
      preferredJob: "Private",
      futureReadyInterest: "Job",
      futureMeaning: "Enthusiasm",
      maritalStatus: "Single",
      category: "General",
      educationStatus: "Pass"
    },
  });

  const educationStatus = watch("educationStatus");
  const hasWorkExperience = watch("hasWorkExperience");

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        const value = data[key as keyof FormData];
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            formData.append(key, JSON.stringify(value));
          } else if (key === "photo" && (value instanceof File || (value && (value as any)[0] instanceof File))) {
            const file = value instanceof File ? value : (value as any)[0];
            formData.append(key, file);
          } else {
            formData.append(key, String(value));
          }
        }
      });
      
      await api.post("/applications", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setResult("Application submitted successfully. Wait for admin verification.");
    } catch {
      setResult("Submission failed. Please try again.");
    }
  };

  return (
    <div className="section py-12 px-4">
      <div className="glass mx-auto max-w-4xl p-8" data-reveal>
        {/* Header */}
        <div className="text-center mb-8 pb-6 border-b">
          <h1 className="text-3xl font-bold text-[var(--brand)] mb-2">AI LEARNING CENTER – Application Form</h1>
          <p className="text-sm text-[var(--muted)] mb-4">Version: 5.0</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-[var(--muted)]">
            <span>Microsoft</span>
            <span>•</span>
            <span>Redington</span>
            <span>•</span>
            <span>AI Impact Summit</span>
            <span>•</span>
            <span>nirmaan.org</span>
          </div>
        </div>

        <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
          {/* Course Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Course</label>
              <select className="w-full rounded-xl border border-[var(--outline)] p-3" {...register("course")}>
                <option>AI/ML</option>
                <option>Deep Learning</option>
                <option>NLP</option>
                <option>Generative AI</option>
                <option>Soft Skills</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Date</label>
              <input type="date" className="w-full rounded-xl border border-[var(--outline)] p-3" defaultValue={new Date().toISOString().split('T')[0]} />
            </div>
          </div>

          {/* Candidate Details */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold border-b pb-2">Candidate Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Candidate's Full Name *</label>
                <input className="w-full rounded-xl border border-[var(--outline)] p-3" {...register("name")} />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Aadhaar No. *</label>
                <input className="w-full rounded-xl border border-[var(--outline)] p-3" {...register("aadhaar")} />
                {errors.aadhaar && <p className="text-xs text-red-500 mt-1">{errors.aadhaar.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Date of Birth *</label>
                <input type="date" className="w-full rounded-xl border border-[var(--outline)] p-3" {...register("dateOfBirth")} />
                {errors.dateOfBirth && <p className="text-xs text-red-500 mt-1">{errors.dateOfBirth.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Age *</label>
                <input type="number" className="w-full rounded-xl border border-[var(--outline)] p-3" {...register("age", { valueAsNumber: true })} />
                {errors.age && <p className="text-xs text-red-500 mt-1">{errors.age.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Educational Qualification *</label>
                <input className="w-full rounded-xl border border-[var(--outline)] p-3" {...register("qualification")} />
                {errors.qualification && <p className="text-xs text-red-500 mt-1">{errors.qualification.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Marital Status *</label>
                <select className="w-full rounded-xl border border-[var(--outline)] p-3" {...register("maritalStatus")}>
                  <option>Single</option>
                  <option>Married</option>
                  <option>Divorced</option>
                  <option>Widowed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Occupation *</label>
                <input className="w-full rounded-xl border border-[var(--outline)] p-3" {...register("occupation")} />
                {errors.occupation && <p className="text-xs text-red-500 mt-1">{errors.occupation.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Languages Known *</label>
                <input className="w-full rounded-xl border border-[var(--outline)] p-3" placeholder="e.g., English, Hindi, Odia" {...register("languages")} />
                {errors.languages && <p className="text-xs text-red-500 mt-1">{errors.languages.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Category *</label>
                <select className="w-full rounded-xl border border-[var(--outline)] p-3" {...register("category")}>
                  <option>General</option>
                  <option>OBC</option>
                  <option>SC</option>
                  <option>ST</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Pre-training Status (If any)</label>
                <input className="w-full rounded-xl border border-[var(--outline)] p-3" {...register("preTrainingStatus")} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Contact Number *</label>
                <input className="w-full rounded-xl border border-[var(--outline)] p-3" {...register("phone")} />
                {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email ID *</label>
                <input className="w-full rounded-xl border border-[var(--outline)] p-3" {...register("email")} />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
              </div>
            </div>
          </div>

          {/* Educational Qualification Details */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold border-b pb-2">Educational Qualification Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Highest Qualification *</label>
                <input className="w-full rounded-xl border border-[var(--outline)] p-3" {...register("highestQualification")} />
                {errors.highestQualification && <p className="text-xs text-red-500 mt-1">{errors.highestQualification.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Group Subjects (if applicable)</label>
                <input className="w-full rounded-xl border border-[var(--outline)] p-3" {...register("groupSubjects")} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Status *</label>
                <select className="w-full rounded-xl border border-[var(--outline)] p-3" {...register("educationStatus")}>
                  <option>Pass</option>
                  <option>Fail</option>
                  <option>Discontinued</option>
                  <option>Pursuing</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">If Pass, Year of Completion</label>
                <input type="text" className="w-full rounded-xl border border-[var(--outline)] p-3" {...register("yearOfCompletion")} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Percentage (%)</label>
                <input className="w-full rounded-xl border border-[var(--outline)] p-3" {...register("percentage")} />
              </div>
            </div>

            {/* If Pursuing */}
            {educationStatus === "Pursuing" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4 bg-blue-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium mb-2">Name of the College</label>
                  <input className="w-full rounded-xl border border-[var(--outline)] p-3" {...register("collegeName")} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">College Timings</label>
                  <input className="w-full rounded-xl border border-[var(--outline)] p-3" {...register("collegeTimings")} />
                </div>
              </div>
            )}

            {/* If Fail/Discontinued */}
            {(educationStatus === "Fail" || educationStatus === "Discontinued") && (
              <div className="mt-4 p-4 bg-red-50 rounded-lg">
                <label className="block text-sm font-medium mb-2">Why didn't you complete the course?</label>
                <textarea className="w-full rounded-xl border border-[var(--outline)] p-3" rows={3} {...register("reasonForNotCompleting")} />
              </div>
            )}
          </div>

          {/* Technical Skills */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold border-b pb-2">Technical Skills</h2>
            <div>
              <label className="block text-sm font-medium mb-2">Technical Skills *</label>
              <textarea className="w-full rounded-xl border border-[var(--outline)] p-3" rows={3} placeholder="List your technical skills..." {...register("technicalSkills")} />
              {errors.technicalSkills && <p className="text-xs text-red-500 mt-1">{errors.technicalSkills.message}</p>}
            </div>
          </div>

          {/* Work Experience */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold border-b pb-2">Work Experience</h2>
            <div>
              <label className="block text-sm font-medium mb-2">Do you have any work experience? *</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input type="radio" value="Yes" {...register("hasWorkExperience")} />
                  Yes
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" value="No" {...register("hasWorkExperience")} />
                  No
                </label>
              </div>
            </div>

            {hasWorkExperience === "Yes" && (
              <div className="space-y-4">
                <p className="text-sm text-[var(--muted)]">Fill the table below for each work experience:</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="p-2 text-left">Organization</th>
                        <th className="p-2 text-left">From</th>
                        <th className="p-2 text-left">To</th>
                        <th className="p-2 text-left">Designation</th>
                        <th className="p-2 text-left">Salary</th>
                        <th className="p-2 text-left">Reason for Leaving</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...Array(workExperienceCount + 1)].map((_, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2"><input className="w-full border p-2 rounded" placeholder="Organization" /></td>
                          <td className="p-2"><input type="date" className="w-full border p-2 rounded" /></td>
                          <td className="p-2"><input type="date" className="w-full border p-2 rounded" /></td>
                          <td className="p-2"><input className="w-full border p-2 rounded" placeholder="Designation" /></td>
                          <td className="p-2"><input className="w-full border p-2 rounded" placeholder="Salary" /></td>
                          <td className="p-2"><input className="w-full border p-2 rounded" placeholder="Reason" /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button type="button" onClick={() => setWorkExperienceCount(workExperienceCount + 1)} className="text-sm text-[var(--brand)] hover:underline">
                  + Add another work experience
                </button>
                <div className="mt-4">
                  <label className="block text-sm font-medium mb-2">Do you have any challenges in your current job/previous job?</label>
                  <textarea className="w-full rounded-xl border border-[var(--outline)] p-3" rows={2} {...register("jobChallenges")} />
                </div>
              </div>
            )}
          </div>

          {/* Job Preference */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold border-b pb-2">Job Preference</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">What is your preferred job? *</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input type="radio" value="Government" {...register("preferredJob")} />
                    Government
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" value="Private" {...register("preferredJob")} />
                    Private
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">If Govt job, mention interested sectors</label>
                <input className="w-full rounded-xl border border-[var(--outline)] p-3" {...register("interestedSectors")} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Are you taking any training for the govt job?</label>
                <input className="w-full rounded-xl border border-[var(--outline)] p-3" {...register("govtJobTraining")} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Do you need any special training for Govt jobs?</label>
                <input className="w-full rounded-xl border border-[var(--outline)] p-3" {...register("specialTrainingNeeded")} />
              </div>
            </div>
          </div>

          {/* Future Ready */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold border-b pb-2">Future Ready Training</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Are you interested in Future Ready training? *</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input type="radio" value="Job" {...register("futureReadyInterest")} />
                    Job
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" value="Further Studies" {...register("futureReadyInterest")} />
                    Further Studies
                  </label>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Why do you want to do this course? *</label>
              <textarea className="w-full rounded-xl border border-[var(--outline)] p-3" rows={3} {...register("whyThisCourse")} />
              {errors.whyThisCourse && <p className="text-xs text-red-500 mt-1">{errors.whyThisCourse.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">If Job, what type of job do you want to do?</label>
              <input className="w-full rounded-xl border border-[var(--outline)] p-3" {...register("jobType")} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">What are your preferred job locations?</label>
              <input className="w-full rounded-xl border border-[var(--outline)] p-3" {...register("preferredLocations")} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">What is your ambition?</label>
              <textarea className="w-full rounded-xl border border-[var(--outline)] p-3" rows={2} {...register("ambition")} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">What does the future mean for you? *</label>
              <select className="w-full rounded-xl border border-[var(--outline)] p-3" {...register("futureMeaning")}>
                <option>Enthusiasm</option>
                <option>Scary</option>
                <option>Very Scary</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">How do you make your future enthusiasm?</label>
              <textarea className="w-full rounded-xl border border-[var(--outline)] p-3" rows={2} {...register("futureEnthusiasm")} />
            </div>
          </div>

          {/* Extracurricular Activities */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold border-b pb-2">Extracurricular Activities</h2>
            <div className="flex flex-wrap gap-4">
              {["Sports", "Dance", "Music", "Drawing"].map((activity) => (
                <label key={activity} className="flex items-center gap-2">
                  <input type="checkbox" value={activity} {...register("extracurricular")} />
                  {activity}
                </label>
              ))}
              <label className="flex items-center gap-2">
                <input type="checkbox" value="Other" {...register("extracurricular")} />
                Other:
              </label>
              <input className="border p-2 rounded" placeholder="Specify" {...register("otherActivity")} />
            </div>
          </div>

          {/* Photo Upload */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold border-b pb-2">Candidate Photo Upload</h2>
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">Upload Passport Size Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  className="w-full rounded-xl border border-[var(--outline)] p-3"
                  {...register("photo", {
                    onChange: (e) => handlePhotoChange(e)
                  })}
                />
                <div className="mt-2 text-xs text-[var(--muted)]">
                  <p>Photo Guidelines:</p>
                  <ul className="list-disc list-inside">
                    <li>Recent passport-size photo</li>
                    <li>White/light background preferred</li>
                    <li>Clear face visibility</li>
                    <li>JPG, PNG accepted</li>
                  </ul>
                </div>
              </div>
              <div className="w-48 h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <div className="text-center p-4">
                    <p className="text-sm text-gray-500">PHOTO AREA</p>
                    <p className="text-xs text-gray-400">(Passport Size)</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Declaration */}
          <div className="space-y-4 p-6 bg-gray-50 rounded-lg">
            <h2 className="text-xl font-bold">Declaration</h2>
            <label className="flex items-start gap-3 text-sm">
              <input type="checkbox" {...register("agreedToTerms")} className="mt-1" />
              <span>
                I hereby declare that all the details mentioned above are in accordance with the truth and fact as per my knowledge and I hold the responsibility for the correctness of the above-mentioned particulars. I'm giving my commitment to complete my training with 100% attendance and go for the placement as suggested by placement manager.
              </span>
            </label>
            {errors.agreedToTerms && <p className="text-xs text-red-500">{errors.agreedToTerms.message}</p>}
          </div>

          {/* Submit */}
          <button disabled={isSubmitting} className="w-full rounded-full bg-[var(--brand)] px-6 py-4 font-semibold text-white disabled:opacity-60 text-lg">
            {isSubmitting ? "Submitting..." : "Submit Application"}
          </button>
        </form>

        {result && (
          <div className={`mt-6 p-4 rounded-lg ${result.includes("success") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
            {result}
          </div>
        )}
      </div>
    </div>
  );
}
