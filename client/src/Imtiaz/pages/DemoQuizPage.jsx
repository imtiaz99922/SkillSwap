import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { AlertCircle, CheckCircle, XCircle, Clock } from "lucide-react";
import "./DemoQuizPage.css";

const DemoQuizPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [quizStarted, setQuizStarted] = useState(false);

  // Fetch quiz
  useEffect(() => {
    fetchQuiz();
  }, [courseId, token]);

  // Timer logic
  useEffect(() => {
    if (!quizStarted || submitted || timeRemaining === null) return;

    if (timeRemaining === 0) {
      handleSubmitQuiz();
      return;
    }

    const timer = setTimeout(() => {
      setTimeRemaining(timeRemaining - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeRemaining, quizStarted, submitted]);

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:5000/api/course-content/${courseId}/demo-quiz`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (response.data.quiz) {
        setQuiz(response.data.quiz);
        const questionsList = response.data.quiz.questions || [];
        setQuestions(questionsList);
        setError(null);
      } else {
        setError("No quiz available for this course");
      }
    } catch (err) {
      console.error("❌ Error fetching quiz:", err);
      setError(err.response?.data?.message || "Failed to load quiz");
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = () => {
    setQuizStarted(true);
    if (quiz?.timeLimit) {
      setTimeRemaining(quiz.timeLimit * 60); // Convert minutes to seconds
    }
  };

  const handleAnswerChange = (questionId, answer) => {
    setUserAnswers({
      ...userAnswers,
      [questionId]: answer,
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    try {
      setSubmitted(true);

      const answers = questions.map((q) => ({
        questionId: q.id || q._id,
        selectedAnswer: userAnswers[q.id || q._id] || "",
      }));

      const response = await axios.post(
        `http://localhost:5000/api/course-content/${courseId}/demo-quiz/attempt`,
        {
          answers,
          timeSpent: quiz?.timeLimit
            ? quiz.timeLimit * 60 - (timeRemaining || 0)
            : 0,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (response.data) {
        setQuizResult(response.data);
      }
    } catch (err) {
      console.error("❌ Error submitting quiz:", err);
      setError(err.response?.data?.message || "Failed to submit quiz");
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  if (loading) {
    return (
      <div className="demo-quiz-page feature-page loading-container">
        <div className="spinner">Loading quiz...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="demo-quiz-page feature-page error-container">
        <div className="error-message">
          <AlertCircle size={48} />
          <h2>Error Loading Quiz</h2>
          <p>{error}</p>
          <button onClick={() => navigate(`/course/${courseId}`)}>
            Back to Course
          </button>
        </div>
      </div>
    );
  }

  if (!quiz || questions.length === 0) {
    return (
      <div className="demo-quiz-page feature-page error-container">
        <div className="error-message">
          <AlertCircle size={48} />
          <h2>No Quiz Available</h2>
          <button onClick={() => navigate(`/course/${courseId}`)}>
            Back to Course
          </button>
        </div>
      </div>
    );
  }

  // Quiz not started yet
  if (!quizStarted) {
    return (
      <div className="demo-quiz-page feature-page quiz-intro">
        <div className="intro-card">
          <h1>📝 {quiz.title || "Demo Quiz"}</h1>
          <div className="quiz-info">
            <div className="info-item">
              <span className="label">Questions:</span>
              <span className="value">{questions.length}</span>
            </div>
            <div className="info-item">
              {quiz.timeLimit && (
                <>
                  <span className="label">Time Limit:</span>
                  <span className="value">{quiz.timeLimit} minutes</span>
                </>
              )}
            </div>
            <div className="info-item">
              <span className="label">Passing Score:</span>
              <span className="value">{quiz.passingScore || 70}%</span>
            </div>
          </div>

          <div className="quiz-rules">
            <h3>Quiz Rules:</h3>
            <ul>
              <li>Answer all questions to complete the quiz</li>
              <li>You can navigate between questions</li>
              <li>Your score will be shown after submission</li>
              <li>Correct answers will be displayed at the end</li>
              {quiz.timeLimit && (
                <li>You have {quiz.timeLimit} minutes to complete</li>
              )}
              {quiz.allowRetakes && (
                <li>You can retake this quiz multiple times</li>
              )}
            </ul>
          </div>

          <button className="start-btn" onClick={handleStartQuiz}>
            Start Quiz →
          </button>

          <button
            className="back-btn"
            onClick={() => navigate(`/course/${courseId}`)}
          >
            Back to Course
          </button>
        </div>
      </div>
    );
  }

  // Quiz completed
  if (submitted && quizResult) {
    return (
      <div className="demo-quiz-page feature-page quiz-results">
        <div className="results-card">
          {quizResult.passed ? (
            <div className="result-header success">
              <CheckCircle size={64} />
              <h1>🎉 Congratulations!</h1>
              <p>You passed the quiz!</p>
            </div>
          ) : (
            <div className="result-header failed">
              <XCircle size={64} />
              <h1>Quiz Completed</h1>
              <p>Keep practicing and try again!</p>
            </div>
          )}

          <div className="score-display">
            <div className="score-main">
              <span className="score-value">{quizResult.percentage}%</span>
              <span className="score-label">Your Score</span>
            </div>
            <div className="score-stats">
              <div className="stat">
                <span className="stat-label">Correct Answers:</span>
                <span className="stat-value">
                  {quizResult.correctCount}/{questions.length}
                </span>
              </div>
              <div className="stat">
                <span className="stat-label">Passing Score:</span>
                <span className="stat-value">{quiz.passingScore || 70}%</span>
              </div>
            </div>
          </div>

          {/* Detailed Answers */}
          {quizResult.correctAnswers && (
            <div className="answers-review">
              <h3>Detailed Answers</h3>
              {questions.map((q, idx) => {
                const userAnswer = userAnswers[q.id || q._id];
                const correctAnswer = quizResult.correctAnswers[idx];
                const isCorrect = userAnswer === correctAnswer;

                return (
                  <div
                    key={q.id || q._id}
                    className={`answer-item ${isCorrect ? "correct" : "incorrect"}`}
                  >
                    <div className="answer-number">Q{idx + 1}</div>
                    <div className="answer-content">
                      <p className="question-text">{q.question}</p>
                      <div className="answer-options">
                        <p>
                          <strong>Your Answer:</strong>{" "}
                          {userAnswer || "Not answered"}
                        </p>
                        {!isCorrect && (
                          <>
                            <p>
                              <strong>Correct Answer:</strong> {correctAnswer}
                            </p>
                            {q.explanation && (
                              <p className="explanation">
                                <strong>Explanation:</strong> {q.explanation}
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                    <div
                      className={`answer-status ${isCorrect ? "correct" : "incorrect"}`}
                    >
                      {isCorrect ? (
                        <CheckCircle size={24} />
                      ) : (
                        <XCircle size={24} />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="results-actions">
            <button
              className="retake-btn"
              onClick={() => {
                setSubmitted(false);
                setCurrentQuestionIndex(0);
                setUserAnswers({});
                setQuizStarted(false);
              }}
            >
              Retake Quiz
            </button>
            <button
              className="buy-btn"
              onClick={() => navigate(`/course/${courseId}`)}
            >
              Back to Course
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Quiz in progress
  const currentQuestion = questions[currentQuestionIndex];
  const questionsAnswered = Object.keys(userAnswers).length;

  return (
    <div className="demo-quiz-page feature-page quiz-progress">
      {/* Header */}
      <div className="quiz-header">
        <h1>{quiz.title || "Demo Quiz"}</h1>
        <div className="header-stats">
          <div className="stat">
            Question {currentQuestionIndex + 1}/{questions.length}
          </div>
          <div className="stat progress">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
                }}
              />
            </div>
          </div>
          {quiz.timeLimit && timeRemaining !== null && (
            <div
              className={`stat timer ${timeRemaining < 60 ? "warning" : ""}`}
            >
              <Clock size={18} />
              {formatTime(timeRemaining)}
            </div>
          )}
        </div>
      </div>

      {/* Question */}
      <div className="quiz-container">
        <div className="question-section">
          <h2>Question {currentQuestionIndex + 1}</h2>
          <p className="question-text">{currentQuestion.question}</p>

          {/* Answer Options */}
          <div className="options">
            {currentQuestion.type === "multipleChoice" && (
              <>
                {(currentQuestion.options || []).map((option, idx) => (
                  <label
                    key={idx}
                    className={`option ${
                      userAnswers[currentQuestion.id || currentQuestion._id] ===
                      option
                        ? "selected"
                        : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${currentQuestionIndex}`}
                      value={option}
                      checked={
                        userAnswers[
                          currentQuestion.id || currentQuestion._id
                        ] === option
                      }
                      onChange={(e) =>
                        handleAnswerChange(
                          currentQuestion.id || currentQuestion._id,
                          e.target.value,
                        )
                      }
                    />
                    <span className="option-text">{option}</span>
                  </label>
                ))}
              </>
            )}

            {currentQuestion.type === "trueFalse" && (
              <>
                {["True", "False"].map((option) => (
                  <label
                    key={option}
                    className={`option ${
                      userAnswers[currentQuestion.id || currentQuestion._id] ===
                      option
                        ? "selected"
                        : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${currentQuestionIndex}`}
                      value={option}
                      checked={
                        userAnswers[
                          currentQuestion.id || currentQuestion._id
                        ] === option
                      }
                      onChange={(e) =>
                        handleAnswerChange(
                          currentQuestion.id || currentQuestion._id,
                          e.target.value,
                        )
                      }
                    />
                    <span className="option-text">{option}</span>
                  </label>
                ))}
              </>
            )}

            {currentQuestion.type === "shortAnswer" && (
              <textarea
                placeholder="Type your answer here..."
                value={
                  userAnswers[currentQuestion.id || currentQuestion._id] || ""
                }
                onChange={(e) =>
                  handleAnswerChange(
                    currentQuestion.id || currentQuestion._id,
                    e.target.value,
                  )
                }
                className="short-answer"
              />
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="quiz-navigation">
          <button
            className="nav-btn"
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
          >
            ← Previous
          </button>

          <span className="answered-count">
            Answered: {questionsAnswered}/{questions.length}
          </span>

          {currentQuestionIndex === questions.length - 1 ? (
            <button className="submit-btn" onClick={handleSubmitQuiz}>
              Submit Quiz
            </button>
          ) : (
            <button
              className="nav-btn"
              onClick={handleNextQuestion}
              disabled={currentQuestionIndex === questions.length - 1}
            >
              Next →
            </button>
          )}
        </div>

        {/* Questions List */}
        <div className="questions-list">
          <h3>Questions ({questionsAnswered} answered)</h3>
          <div className="questions-grid">
            {questions.map((q, idx) => (
              <button
                key={q.id || q._id}
                className={`question-badge ${
                  idx === currentQuestionIndex ? "current" : ""
                } ${userAnswers[q.id || q._id] ? "answered" : ""}`}
                onClick={() => setCurrentQuestionIndex(idx)}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoQuizPage;
