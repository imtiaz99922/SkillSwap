import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { searchApi } from "../services/searchApi";

export default function CourseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    searchApi
      .getSkillDetail(id)
      .then((data) => {
        if (active) setCourse(data);
      })
      .catch((err) => {
        console.error(err);
        if (active) setError("Unable to load course details.");
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-6 bg-white rounded-3xl shadow-sm text-center">
        Loading course details...
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="max-w-5xl mx-auto p-6 bg-rose-50 rounded-3xl border border-rose-200 text-rose-700">
        <p>{error || "Course not found."}</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 rounded-2xl bg-slate-900 px-4 py-2 text-white"
        >
          Back
        </button>
      </div>
    );
  }

  const hasQuiz = !!course.challenge;
  const owner = course.owner || {};
  const profile = course.ownerProfile || {};

  return (
    <div className="feature-page">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="card">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-900">
                {course.title}
              </h1>
              <p className="mt-3 text-slate-600">{course.description}</p>
              <div className="mt-4 flex flex-wrap gap-3">
                {course.category && (
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    Category: {course.category}
                  </span>
                )}
                <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  Level: {course.level}
                </span>
                <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                  {course.type === "teach" ? "Offer" : "Request"}
                </span>
                {hasQuiz && (
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                    Demo quiz ready
                  </span>
                )}
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="rounded-2xl border border-slate-300 bg-white px-6 py-3 text-slate-900 transition hover:bg-slate-50"
              >
                Back to courses
              </button>
              <button
                type="button"
                onClick={() => {
                  if (hasQuiz) navigate(`/quizzes/${course.challenge._id}`);
                }}
                disabled={!hasQuiz}
                className="rounded-2xl bg-blue-600 px-6 py-3 text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {hasQuiz ? "Start Demo Quiz" : "Quiz not available"}
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
            <h2 className="text-xl font-semibold text-slate-900">Instructor</h2>
            <p className="mt-3 text-slate-700">{owner.name || "Unknown"}</p>
            <p className="mt-1 text-sm text-slate-500">
              {owner.email || "No email"}
            </p>
            {profile.bio && (
              <p className="mt-4 text-sm text-slate-600">{profile.bio}</p>
            )}
            <div className="mt-5 space-y-3">
              <button
                onClick={() => navigate(`/chat?user=${owner._id}`)}
                className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-white hover:bg-slate-700"
              >
                Message Instructor
              </button>
              {course.type === "teach" && (
                <button
                  onClick={() => navigate(`/availability?user=${owner._id}`)}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 hover:bg-slate-50"
                >
                  Book a slot
                </button>
              )}
            </div>
          </div>
          <div className="lg:col-span-2 rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
            <h2 className="text-xl font-semibold text-slate-900">
              Course Summary
            </h2>
            <div className="mt-4 space-y-4 text-slate-600">
              <div>
                <h3 className="font-semibold text-slate-900">Description</h3>
                <p className="mt-2">{course.description}</p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Tags</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {course.tags?.length > 0 ? (
                    course.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700"
                      >
                        #{tag}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-500">No tags added.</span>
                  )}
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Demo Quiz</h3>
                <p className="mt-2 text-slate-600">
                  {hasQuiz
                    ? `Includes a demo quiz titled "${course.challenge.title}" with ${course.challenge.difficulty} difficulty.`
                    : "A demo quiz is not currently attached to this course."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
