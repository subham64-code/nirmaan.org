"use client";

import { useState } from "react";
import { TrainingContentService, TrainingPath, TrainingModule } from "@/lib/training-content";
import { BookOpen, Clock, Target, Users, ChevronRight, ChevronDown, Award, PlayCircle } from "lucide-react";

export default function TrainingContentViewer() {
  const [selectedPath, setSelectedPath] = useState<TrainingPath | null>(null);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const trainingPaths = TrainingContentService.getAllTrainingPaths();
  const categories = ["all", "AI/ML", "Deep Learning", "NLP", "Generative AI", "Soft Skills"];

  const filteredPaths = selectedCategory === "all" 
    ? trainingPaths 
    : trainingPaths.filter(path => path.category === selectedCategory);

  const toggleModuleExpansion = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner": return "bg-green-100 text-green-800";
      case "Intermediate": return "bg-yellow-100 text-yellow-800";
      case "Advanced": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "AI/ML": return "bg-blue-100 text-blue-800";
      case "Deep Learning": return "bg-purple-100 text-purple-800";
      case "NLP": return "bg-indigo-100 text-indigo-800";
      case "Generative AI": return "bg-pink-100 text-pink-800";
      case "Soft Skills": return "bg-teal-100 text-teal-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <BookOpen className="w-6 h-6 text-blue-500" />
        <h2 className="text-xl font-semibold">Training Programs</h2>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedCategory === category
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {category === "all" ? "All Programs" : category}
          </button>
        ))}
      </div>

      {/* Training Paths Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredPaths.map((path) => (
          <div
            key={path.id}
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              selectedPath?.id === path.id
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => setSelectedPath(path)}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-lg">{path.name}</h3>
                <p className="text-gray-600 text-sm mt-1">{path.description}</p>
              </div>
              <div className="flex flex-col gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(path.difficulty)}`}>
                  {path.difficulty}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(path.category)}`}>
                  {path.category}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{path.totalDuration}</span>
              </div>
              <div className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                <span>{path.modules.length} modules</span>
              </div>
            </div>

            {/* Module Preview */}
            <div className="mt-4 space-y-2">
              {path.modules.slice(0, 2).map((module) => (
                <div key={module.id} className="flex items-center gap-2 text-sm text-gray-600">
                  <PlayCircle className="w-3 h-3" />
                  <span>{module.title}</span>
                </div>
              ))}
              {path.modules.length > 2 && (
                <div className="text-sm text-blue-500">
                  +{path.modules.length - 2} more modules
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Selected Path Details */}
      {selectedPath && (
        <div className="mt-8 border-t pt-6">
          <div className="flex items-center gap-3 mb-6">
            <Target className="w-6 h-6 text-blue-500" />
            <h3 className="text-xl font-semibold">{selectedPath.name} - Detailed Curriculum</h3>
          </div>

          <div className="space-y-4">
            {selectedPath.modules.map((module, index) => (
              <div
                key={module.id}
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                <div
                  className="p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => toggleModuleExpansion(module.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-semibold">{module.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{module.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-sm text-gray-500">
                        <Clock className="w-4 h-4 inline mr-1" />
                        {module.duration}
                      </div>
                      {expandedModules.has(module.id) ? (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-500" />
                      )}
                    </div>
                  </div>
                </div>

                {expandedModules.has(module.id) && (
                  <div className="p-4 bg-white border-t">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Topics */}
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                          <BookOpen className="w-4 h-4" />
                          Topics Covered
                        </h5>
                        <ul className="space-y-1">
                          {module.topics.map((topic, idx) => (
                            <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                              <span className="text-blue-500 mt-1">•</span>
                              <span>{topic}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Learning Objectives */}
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                          <Target className="w-4 h-4" />
                          Learning Objectives
                        </h5>
                        <ul className="space-y-1">
                          {module.learningObjectives.map((objective, idx) => (
                            <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                              <span className="text-green-500 mt-1">✓</span>
                              <span>{objective}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Prerequisites and Assessment */}
                    <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          Prerequisites
                        </h5>
                        <div className="flex flex-wrap gap-2">
                          {module.prerequisites.map((prereq, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full"
                            >
                              {prereq}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                          <Award className="w-4 h-4" />
                          Assessment Type
                        </h5>
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                          {module.assessmentType}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
