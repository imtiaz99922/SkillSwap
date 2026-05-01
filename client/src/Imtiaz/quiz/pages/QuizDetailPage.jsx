import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { quizApi } from "../services/quizApi";

export default function QuizDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    quizApi
      .getChallenge(id)
      .then((data) => {
        if (active) {
          setChallenge(data);
          setSelectedAnswers(Array(data.questions.length).fill(null));
        }
      })
      .catch((err) => {
        console.error(err);
        if (active) setError("Quiz could not be loaded.");
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id]);

  const handleOptionSelect = (questionIndex, optionIndex) => {
    setSelectedAnswers((prev) => {
      const next = [...prev];
      next[questionIndex] = optionIndex;
      return next;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!challenge) return;

    if (selectedAnswers.some((answer) => answer === null)) {
      setError("Please answer all questions before submitting.");
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const data = await quizApi.submitChallenge(id, selectedAnswers);
      setResult(data);
    } catch (err) {
      console.error(err);
      setError("Unable to submit your answers. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm text-center">
        Loading quiz...
      </div>
    );
  }

  if (error && !challenge) {
    return (
      <div className="p-6 bg-red-50 rounded-lg border border-red-200 text-red-700">
        <p>{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 rounded-lg bg-slate-800 px-4 py-2 text-white"
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-200">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">{challenge.title}</h1>
            {challenge.skillName ? (
              <p className="mt-2 text-sm text-slate-500">
                Course:{" "}
                <span className="font-medium">{challenge.skillName}</span>
              </p>
            ) : null}
            <p className="mt-2 text-slate-600">{challenge.description}</p>
          </div>
          <div className="rounded-2xl bg-slate-100 px-4 py-2 text-sm text-slate-700">
            Reward: {challenge.creditsReward} credits
          </div>
        </div>
      </div>

      {result ? (
        <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-200">
          <h2 className="text-2xl font-semibold">Results</h2>
          <p className="mt-3 text-slate-700">
            Score: <strong>{result.score}%</strong> —{" "}
            {result.passed ? "Passed" : "Failed"}
          </p>
          <p className="mt-1 text-slate-600">
            Credits earned: <strong>{result.attempt.creditsEarned}</strong>
          </p>
          <button
            onClick={() => {
              setResult(null);
              setError(null);
              setSelectedAnswers(Array(challenge.questions.length).fill(null));
            }}
            className="mt-6 rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-800 hover:bg-slate-50"
          >
            Retry Quiz
          </button>
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-6">
        {challenge.questions.map((question, index) => {
          const selected = selectedAnswers[index];
          const answerEntry = result?.attempt.answers?.find(
            (item) => item.questionIndex === index,
          );
          return (
            <fieldset
              key={index}
              className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200"
            >
              <legend className="text-lg font-semibold text-slate-900">
                {index + 1}. {question.question}
              </legend>
              <div className="mt-4 space-y-3">
                {question.options.map((option, optionIndex) => {
                  const isSelected = selected === optionIndex;
                  const isCorrect =
                    answerEntry?.selectedAnswer === optionIndex &&
                    answerEntry?.correct;
                  const isIncorrect =
                    answerEntry?.selectedAnswer === optionIndex &&
                    answerEntry?.correct === false;
                  return (
                    <label
                      key={optionIndex}
                      className={`block cursor-pointer rounded-2xl border px-4 py-3 text-sm transition ${
                        isSelected
                          ? "border-slate-900 bg-slate-100"
                          : "border-slate-200 bg-white"
                      } ${isCorrect ? "ring-2 ring-emerald-400" : ""} ${isIncorrect ? "ring-2 ring-rose-400" : ""}`}
                    >
                      <input
                        type="radio"
                        name={`question-${index}`}
                        value={optionIndex}
                        checked={selected === optionIndex}
                        disabled={!!result}
                        onChange={() => handleOptionSelect(index, optionIndex)}
                        className="mr-3 h-4 w-4 text-slate-900"
                      />
                      <span>{option}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          );
        })}

        {error ? (
          <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 text-rose-700">
            {error}
          </div>
        ) : null}

        {!result && (
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-6 py-3 text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Submitting..." : "Submit Answers"}
          </button>
        )}
      </form>
    </div>
  );
}
