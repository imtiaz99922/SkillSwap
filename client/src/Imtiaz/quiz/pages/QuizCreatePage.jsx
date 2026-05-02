import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { quizApi } from "../services/quizApi";
import { searchApi } from "../../../Adib/search/services/searchApi";
import "../../../styles/ModernDesign.css";

export default function QuizCreatePage() {
  const navigate = useNavigate();
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [useManualSkill, setUseManualSkill] = useState(false);

  const [formData, setFormData] = useState({
    skillId: "custom",
    skillName: "",
    title: "",
    description: "",
    difficulty: "Intermediate",
    passingScore: 70,
    creditsReward: 10,
    questions: [
      {
        question: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
        explanation: "",
      },
    ],
  });

  useEffect(() => {
    // Fetch available skills
    searchApi
      .getAllSkills()
      .then((data) => {
        const teachingSkills = data.filter((skill) => skill.type === "teach");
        setSkills(teachingSkills);
        setLoading(false);
        if (teachingSkills.length === 0) {
          setUseManualSkill(true);
        }
      })
      .catch((err) => {
        console.error("Failed to load skills:", err);
        setLoading(false);
        setUseManualSkill(true);
      });
  }, []);

  const handleSkillChange = (e) => {
    const selectedSkill = skills.find((s) => s._id === e.target.value);
    if (selectedSkill) {
      setFormData({
        ...formData,
        skillId: selectedSkill._id,
        skillName: selectedSkill.title,
      });
    }
  };

  const handleBasicFieldChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]:
        name === "passingScore" || name === "creditsReward"
          ? parseInt(value)
          : value,
    });
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...formData.questions];
    if (field === "question" || field === "explanation") {
      updatedQuestions[index][field] = value;
    } else if (field === "correctAnswer") {
      updatedQuestions[index][field] = parseInt(value);
    }
    setFormData({ ...formData, questions: updatedQuestions });
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[questionIndex].options[optionIndex] = value;
    setFormData({ ...formData, questions: updatedQuestions });
  };

  const addQuestion = () => {
    setFormData({
      ...formData,
      questions: [
        ...formData.questions,
        {
          question: "",
          options: ["", "", "", ""],
          correctAnswer: 0,
          explanation: "",
        },
      ],
    });
  };

  const removeQuestion = (index) => {
    if (formData.questions.length > 1) {
      setFormData({
        ...formData,
        questions: formData.questions.filter((_, i) => i !== index),
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.skillName || !formData.title) {
      setError("Please enter a skill name and quiz title");
      return;
    }

    const hasEmptyQuestions = formData.questions.some(
      (q) => !q.question || q.options.some((opt) => !opt),
    );
    if (hasEmptyQuestions) {
      setError("Please fill in all questions and options");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Use a placeholder skillId for manual entries
      const skillId =
        formData.skillId === "custom"
          ? "custom_" + Date.now()
          : formData.skillId;

      const response = await quizApi.createChallenge({
        skillId: skillId,
        skillName: formData.skillName,
        title: formData.title,
        description: formData.description,
        difficulty: formData.difficulty,
        questions: formData.questions,
        passingScore: formData.passingScore,
        creditsReward: formData.creditsReward,
      });

      // Navigate to quiz list after successful creation
      navigate("/quizzes", {
        state: { message: `Quiz "${formData.title}" created successfully!` },
      });
    } catch (err) {
      console.error("Failed to create quiz:", err);
      setError(err.response?.data?.msg || "Failed to create quiz");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Create Your Own Quiz</h1>
        <p className="text-gray-600">
          Design a quiz by typing questions, adding options, and specifying
          correct answers.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
          <h2 className="text-2xl font-semibold">Quiz Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {useManualSkill ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skill/Course Name *
                </label>
                <input
                  type="text"
                  value={formData.skillName}
                  onChange={(e) =>
                    setFormData({ ...formData, skillName: e.target.value })
                  }
                  placeholder="e.g., Python Programming, Web Development"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {skills.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setUseManualSkill(false)}
                    className="mt-2 text-sm text-blue-500 hover:underline"
                  >
                    Or select from available skills
                  </button>
                )}
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Skill *
                </label>
                {skills.length === 0 ? (
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                    <p className="text-sm text-gray-600 mb-2">
                      No skills available
                    </p>
                    <button
                      type="button"
                      onClick={() => setUseManualSkill(true)}
                      className="text-sm text-blue-500 hover:underline"
                    >
                      Enter skill name manually
                    </button>
                  </div>
                ) : (
                  <select
                    value={formData.skillId}
                    onChange={handleSkillChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Choose a skill...</option>
                    {skills.map((skill) => (
                      <option key={skill._id} value={skill._id}>
                        {skill.title}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quiz Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleBasicFieldChange}
                placeholder="e.g., Python Basics Quiz"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleBasicFieldChange}
              placeholder="Optional: Describe what this quiz covers"
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty Level
              </label>
              <select
                name="difficulty"
                value={formData.difficulty}
                onChange={handleBasicFieldChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Passing Score (%)
              </label>
              <input
                type="number"
                name="passingScore"
                value={formData.passingScore}
                onChange={handleBasicFieldChange}
                min="0"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Credits Reward
              </label>
              <input
                type="number"
                name="creditsReward"
                value={formData.creditsReward}
                onChange={handleBasicFieldChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-6">Quiz Questions</h2>

          <div className="space-y-8">
            {formData.questions.map((question, qIndex) => (
              <div
                key={qIndex}
                className="border border-gray-200 rounded-lg p-6 bg-gray-50"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">
                    Question {qIndex + 1}
                  </h3>
                  {formData.questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeQuestion(qIndex)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  {/* Question Text */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Question Text *
                    </label>
                    <textarea
                      value={question.question}
                      onChange={(e) =>
                        handleQuestionChange(qIndex, "question", e.target.value)
                      }
                      placeholder="Enter your question here"
                      rows="2"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Options */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Answer Options *
                    </label>
                    <div className="space-y-2">
                      {question.options.map((option, oIndex) => (
                        <div key={oIndex} className="flex gap-2">
                          <input
                            type="radio"
                            name={`correct-${qIndex}`}
                            value={oIndex}
                            checked={question.correctAnswer === oIndex}
                            onChange={(e) =>
                              handleQuestionChange(
                                qIndex,
                                "correctAnswer",
                                e.target.value,
                              )
                            }
                            className="mt-2"
                          />
                          <input
                            type="text"
                            value={option}
                            onChange={(e) =>
                              handleOptionChange(qIndex, oIndex, e.target.value)
                            }
                            placeholder={`Option ${oIndex + 1}`}
                            required
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Select the radio button next to the correct answer
                    </p>
                  </div>

                  {/* Explanation */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Explanation (Optional)
                    </label>
                    <textarea
                      value={question.explanation}
                      onChange={(e) =>
                        handleQuestionChange(
                          qIndex,
                          "explanation",
                          e.target.value,
                        )
                      }
                      placeholder="Explain why this is the correct answer"
                      rows="2"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addQuestion}
            className="mt-6 w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
          >
            + Add Another Question
          </button>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-green-500 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-green-600 disabled:opacity-50"
          >
            {loading ? "Creating Quiz..." : "Create Quiz"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/quizzes")}
            className="flex-1 px-6 py-3 bg-gray-300 text-gray-800 font-semibold rounded-lg hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
