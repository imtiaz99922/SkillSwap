const mongoose = require("mongoose");

const CourseContentSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    instructorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    contentType: {
      type: String,
      enum: ["video", "document", "image", "text", "file", "link"],
      required: true,
    },
    content: {
      type: String, // URL for videos, document links, text content, file paths
      required: true,
    },
    description: {
      type: String,
      default: null,
    },
    duration: {
      type: Number,
      default: null, // for videos, in minutes
    },
    fileSize: {
      type: Number,
      default: null, // in bytes
    },
    fileType: {
      type: String,
      default: null,
    },
    order: {
      type: Number,
      required: true, // for ordering content within course
    },
    section: {
      type: String,
      default: "General", // module/section name
    },
    isRequired: {
      type: Boolean,
      default: true,
    },
    isPreviewable: {
      type: Boolean,
      default: false, // can be viewed before purchase
    },
    thumbnail: {
      type: String,
      default: null,
    },
    accessLevel: {
      type: String,
      enum: ["free", "enrolled", "premium"],
      default: "enrolled",
    },
    userProgress: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        viewed: Boolean,
        completedAt: Date,
        timeSpent: Number, // in seconds
      },
    ],
  },
  {
    timestamps: true,
  },
);

// Indexes
CourseContentSchema.index({ courseId: 1, order: 1 });
CourseContentSchema.index({ courseId: 1, section: 1 });
CourseContentSchema.index({ instructorId: 1 });

module.exports = mongoose.model("CourseContent", CourseContentSchema);
