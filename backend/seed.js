const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");
require("dotenv").config();

// Import all models
const User = require("./models/User");
const UserProfile = require("./models/UserProfile");
const Skill = require("./models/Skill");
const Challenge = require("./models/Challenge");
const ChallengeAttempt = require("./models/ChallengeAttempt");
const Wallet = require("./models/Wallet");
const Payment = require("./models/Payment");
const Transaction = require("./models/Transaction");
const Availability = require("./models/Availability");

async function connectDB() {
  try {
    let mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      // Use the same in-memory database logic as server.js
      const { MongoMemoryServer } = require("mongodb-memory-server");
      const mem = await MongoMemoryServer.create();
      mongoUri = mem.getUri();
      global.__MONGO_MEMORY_SERVER__ = mem;
      console.log("Started in-memory MongoDB for seeding");
    }

    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected for seeding");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
}

async function seedDatabase() {
  try {
    // Clear existing data
    await User.deleteMany({});
    await UserProfile.deleteMany({});
    await Skill.deleteMany({});
    await Challenge.deleteMany({});
    await ChallengeAttempt.deleteMany({});
    await Wallet.deleteMany({});
    await Payment.deleteMany({});
    await Transaction.deleteMany({});
    await Availability.deleteMany({});
    console.log("Cleared existing data");

    // Create dummy users
    const users = await User.insertMany([
      {
        name: "Death Soul",
        email: "deathsoul241@gmail.com",
        password: await bcryptjs.hash("123456", 10),
      },
      {
        name: "Test User",
        email: "test@skillswap.com",
        password: await bcryptjs.hash("123456", 10),
      },
      {
        name: "Alice Johnson",
        email: "alice@example.com",
        password: await bcryptjs.hash("password123", 10),
      },
      {
        name: "Bob Smith",
        email: "bob@example.com",
        password: await bcryptjs.hash("password123", 10),
      },
      {
        name: "Carol White",
        email: "carol@example.com",
        password: await bcryptjs.hash("password123", 10),
      },
      {
        name: "David Brown",
        email: "david@example.com",
        password: await bcryptjs.hash("password123", 10),
      },
      {
        name: "Emma Davis",
        email: "emma@example.com",
        password: await bcryptjs.hash("password123", 10),
      },
    ]);
    console.log(`Created ${users.length} users`);

    // Create user profiles
    const userProfiles = await UserProfile.insertMany([
      {
        userId: users[0]._id,
        university: "Your University",
        availability: "Anytime",
        rating: 5,
        totalReviews: 0,
        bio: "Welcome back to SkillSwap!",
        location: "Your City",
        profileImage: "https://i.pravatar.cc/150?img=10",
      },
      {
        userId: users[1]._id,
        university: "Test University",
        availability: "Anytime",
        rating: 5,
        totalReviews: 10,
        bio: "Test Account for Application",
        location: "Test City, TC",
        profileImage: "https://i.pravatar.cc/150?img=0",
      },
      {
        userId: users[2]._id,
        university: "Stanford University",
        availability: "Weekends",
        rating: 4.8,
        totalReviews: 25,
        bio: "Expert in Python and Web Development",
        location: "San Francisco, CA",
        profileImage: "https://i.pravatar.cc/150?img=1",
      },
      {
        userId: users[3]._id,
        university: "MIT",
        availability: "Weekdays",
        rating: 4.6,
        totalReviews: 18,
        bio: "Data Science & Machine Learning Enthusiast",
        location: "Boston, MA",
        profileImage: "https://i.pravatar.cc/150?img=2",
      },
      {
        userId: users[4]._id,
        university: "UC Berkeley",
        availability: "Anytime",
        rating: 4.9,
        totalReviews: 32,
        bio: "Full Stack Developer, love teaching",
        location: "Berkeley, CA",
        profileImage: "https://i.pravatar.cc/150?img=3",
      },
      {
        userId: users[5]._id,
        university: "Harvard University",
        availability: "Weekends",
        rating: 4.7,
        totalReviews: 20,
        bio: "Mobile App Development Expert",
        location: "Cambridge, MA",
        profileImage: "https://i.pravatar.cc/150?img=4",
      },
      {
        userId: users[6]._id,
        university: "Carnegie Mellon",
        availability: "Anytime",
        rating: 4.5,
        totalReviews: 15,
        bio: "Cloud Computing & DevOps Specialist",
        location: "Pittsburgh, PA",
        profileImage: "https://i.pravatar.cc/150?img=5",
      },
    ]);
    console.log(`Created ${userProfiles.length} user profiles`);

    // Create skills
    const skills = await Skill.insertMany([
      // Alice's Teaching Skills
      {
        userId: users[2]._id,
        title: "Advanced Python Programming",
        type: "teach",
        level: "advanced",
        category: "Programming",
        description:
          "Learn advanced Python with Django and Flask frameworks. Master decorators, generators, and async programming.",
        tags: ["python", "django", "flask", "backend"],
      },
      {
        userId: users[2]._id,
        title: "Python for Beginners",
        type: "teach",
        level: "beginner",
        category: "Programming",
        description:
          "Start your Python journey! Learn the basics of syntax, data structures, and fundamental programming concepts.",
        tags: ["python", "basics", "beginner-friendly"],
      },
      // Bob's Teaching Skills
      {
        userId: users[2]._id,
        title: "Machine Learning Mastery",
        type: "teach",
        level: "advanced",
        category: "Data Science",
        description:
          "Deep dive into machine learning with TensorFlow and scikit-learn. Build production-ready ML models.",
        tags: ["machine-learning", "tensorflow", "data-science", "ai"],
      },
      {
        userId: users[2]._id,
        title: "Data Science Fundamentals",
        type: "teach",
        level: "beginner",
        category: "Data Science",
        description:
          "Introduction to data science, statistics, and exploratory data analysis with Python and pandas.",
        tags: ["data-science", "pandas", "statistics", "beginner"],
      },
      // Carol's Teaching Skills
      {
        userId: users[6]._id,
        title: "Full Stack MERN Development",
        type: "teach",
        level: "advanced",
        category: "Web Development",
        description:
          "Master MongoDB, Express, React, and Node.js. Build complete web applications from frontend to backend.",
        tags: ["mern", "react", "nodejs", "mongodb", "full-stack"],
      },
      {
        userId: users[6]._id,
        title: "React.js Essentials",
        type: "teach",
        level: "intermediate",
        category: "Web Development",
        description:
          "Learn React fundamentals including components, hooks, state management, and routing.",
        tags: ["react", "javascript", "frontend", "web"],
      },
      // David's Teaching Skills
      {
        userId: users[6]._id,
        title: "React Native Mobile Apps",
        type: "teach",
        level: "advanced",
        category: "Mobile Development",
        description:
          "Build iOS and Android apps with React Native. Learn best practices for cross-platform development.",
        tags: ["react-native", "mobile", "ios", "android"],
      },
      {
        userId: users[6]._id,
        title: "JavaScript Fundamentals",
        type: "teach",
        level: "beginner",
        category: "Programming",
        description:
          "Master JavaScript basics, ES6+ features, and DOM manipulation for web development.",
        tags: ["javascript", "es6", "web", "beginner"],
      },
      // Emma's Teaching Skills
      {
        userId: users[6]._id,
        title: "Kubernetes & Container Orchestration",
        type: "teach",
        level: "advanced",
        category: "DevOps",
        description:
          "Learn Kubernetes for managing containerized applications at scale with best practices.",
        tags: ["kubernetes", "docker", "devops", "cloud"],
      },
      {
        userId: users[6]._id,
        title: "Docker Basics",
        type: "teach",
        level: "beginner",
        category: "DevOps",
        description:
          "Introduction to Docker containers, creating images, and deploying applications.",
        tags: ["docker", "containers", "devops", "beginner"],
      },
      // Learning Skills (to demonstrate skill exchange)
      {
        userId: users[2]._id,
        title: "Want to Learn React",
        type: "learn",
        level: "beginner",
        category: "Web Development",
        description:
          "Looking to learn React.js and modern frontend development.",
        tags: ["react", "frontend", "javascript"],
      },
      {
        userId: users[2]._id,
        title: "Looking for Web Development Mentorship",
        type: "learn",
        level: "intermediate",
        category: "Web Development",
        description:
          "Seeking guidance on full-stack development and best practices.",
        tags: ["web-development", "mentoring", "full-stack"],
      },
      {
        userId: users[6]._id,
        title: "Want to Master DevOps",
        type: "learn",
        level: "intermediate",
        category: "DevOps",
        description:
          "Looking to learn Docker, Kubernetes, and DevOps practices.",
        tags: ["devops", "kubernetes", "docker"],
      },
      {
        userId: users[6]._id,
        title: "Learn Cloud Architecture with AWS",
        type: "learn",
        level: "beginner",
        category: "Cloud",
        description:
          "Seeking to learn AWS services and cloud architecture design.",
        tags: ["aws", "cloud", "architecture"],
      },
      {
        userId: users[6]._id,
        title: "Mobile Development Learning",
        type: "learn",
        level: "beginner",
        category: "Mobile Development",
        description:
          "Want to get started with mobile app development, preferably React Native.",
        tags: ["mobile", "react-native", "app-development"],
      },
    ]);
    console.log(`Created ${skills.length} skills`);

    // Create demo quizzes for every course listing
    const challenges = await Challenge.insertMany([
      {
        skillId: skills[0]._id,
        skillName: "Advanced Python Programming",
        title: "Advanced Python Demo Quiz",
        description:
          "Validate your advanced Python knowledge with 10 demo questions.",
        difficulty: "Advanced",
        questions: [
          {
            question:
              "What is the most idiomatic way to swap two variables in Python?",
            options: [
              "a = b; b = a",
              "a, b = b, a",
              "temp = a; a = b; b = temp",
              "swap(a, b)",
            ],
            correctAnswer: 1,
            explanation:
              "Python supports tuple unpacking for swapping values in one statement.",
          },
          {
            question:
              "Which keyword is used to define an asynchronous function in Python?",
            options: ["async", "await", "defer", "thread"],
            correctAnswer: 0,
            explanation: "async defines an asynchronous function in Python.",
          },
          {
            question:
              "What does a generator function use to return its values?",
            options: ["return", "yield", "emit", "send"],
            correctAnswer: 1,
            explanation:
              "Generators use yield to produce a sequence of values lazily.",
          },
          {
            question:
              "Which library is commonly used for building web applications in Python?",
            options: ["Flask", "Express", "ASP.NET", "Laravel"],
            correctAnswer: 0,
            explanation: "Flask is a lightweight Python web framework.",
          },
          {
            question:
              "What is the output of list(filter(lambda x: x % 2 == 0, [1,2,3,4]))?",
            options: ["[1, 2, 3, 4]", "[2, 4]", "[1, 3]", "Error"],
            correctAnswer: 1,
            explanation: "filter returns only even numbers from the list.",
          },
          {
            question: "What feature does @decorator add to a function?",
            options: [
              "Changes return type",
              "Wraps additional behavior around the function",
              "Enforces type hints",
              "Modifies indentation",
            ],
            correctAnswer: 1,
            explanation:
              "Decorators wrap functions to add behavior without changing the function body.",
          },
          {
            question:
              "Which statement ensures resources are automatically cleaned up?",
            options: ["try/catch", "with", "finally", "using"],
            correctAnswer: 1,
            explanation:
              "The with statement manages resources and cleans them up automatically.",
          },
          {
            question:
              "Which built-in type preserves insertion order for key/value pairs?",
            options: ["set", "dict", "list", "tuple"],
            correctAnswer: 1,
            explanation:
              "dict preserves insertion order in modern Python versions.",
          },
          {
            question: "What does typing.List[int] represent?",
            options: [
              "A function",
              "A list of integers",
              "A tuple of strings",
              "A dictionary",
            ],
            correctAnswer: 1,
            explanation:
              "typing.List[int] indicates a list containing integer values.",
          },
          {
            question:
              "Which module is commonly used for HTTP requests in Python?",
            options: ["requests", "http-client", "promise", "socket"],
            correctAnswer: 0,
            explanation:
              "The requests library is widely used for making HTTP requests.",
          },
        ],
        passingScore: 70,
        creditsReward: 20,
      },
      {
        skillId: skills[1]._id,
        skillName: "Python for Beginners",
        title: "Python for Beginners Quiz",
        description:
          "Practice the fundamentals of Python syntax and data structures.",
        difficulty: "Beginner",
        questions: [
          {
            question: "Which symbol begins a comment in Python?",
            options: ["//", "#", "/*", "--"],
            correctAnswer: 1,
            explanation: "Python uses # for comments.",
          },
          {
            question: "How do you define a function in Python?",
            options: [
              "func myFunc()",
              "def myFunc():",
              "function myFunc()",
              "fun myFunc()",
            ],
            correctAnswer: 1,
            explanation: "def keyword defines a function in Python.",
          },
          {
            question: "Which of these is a mutable sequence type?",
            options: ["tuple", "str", "list", "int"],
            correctAnswer: 2,
            explanation: "list is mutable and can be modified after creation.",
          },
          {
            question: "What is the output of print(2 + 3 * 4)?",
            options: ["20", "14", "24", "10"],
            correctAnswer: 1,
            explanation:
              "Multiplication runs before addition, so 3*4 + 2 = 14.",
          },
          {
            question: "Which structure is used for decision making in Python?",
            options: ["if/elif/else", "for/while", "try/except", "class"],
            correctAnswer: 0,
            explanation: "if/elif/else handles conditional branching.",
          },
          {
            question: "What does len('hello') return?",
            options: ["4", "5", "6", "hello"],
            correctAnswer: 1,
            explanation: "len returns the number of characters in the string.",
          },
          {
            question: "How do you access the first element of a list x?",
            options: ["x(0)", "x[1]", "x[0]", "x.first"],
            correctAnswer: 2,
            explanation: "Python uses zero-based indexing.",
          },
          {
            question:
              "Which keyword creates a loop that runs while a condition is true?",
            options: ["for", "until", "while", "repeat"],
            correctAnswer: 2,
            explanation:
              "while repeats a block as long as the condition is true.",
          },
          {
            question: "What type is returned by input() in Python?",
            options: ["int", "str", "float", "bool"],
            correctAnswer: 1,
            explanation: "input() always returns a string.",
          },
          {
            question: "Which keyword adds a new item to a list?",
            options: ["add()", "append()", "insert()", "push()"],
            correctAnswer: 1,
            explanation: "append() adds an item to the end of a list.",
          },
        ],
        passingScore: 70,
        creditsReward: 15,
      },
      {
        skillId: skills[2]._id,
        skillName: "Machine Learning Mastery",
        title: "Machine Learning Mastery Quiz",
        description:
          "Check your machine learning fundamentals with a 10-question quiz.",
        difficulty: "Advanced",
        questions: [
          {
            question: "Which type of learning uses labeled data?",
            options: [
              "Supervised",
              "Unsupervised",
              "Reinforcement",
              "Transfer",
            ],
            correctAnswer: 0,
            explanation: "Supervised learning uses labeled data.",
          },
          {
            question:
              "Which metric is used for binary classification accuracy?",
            options: ["MSE", "Accuracy", "Silhouette", "RMSE"],
            correctAnswer: 1,
            explanation:
              "Accuracy measures correct predictions out of total samples.",
          },
          {
            question: "What is a common way to prevent overfitting?",
            options: [
              "Decrease data",
              "Increase model complexity",
              "Use regularization",
              "Remove validation",
            ],
            correctAnswer: 2,
            explanation: "Regularization discourages overly complex models.",
          },
          {
            question: "What does a confusion matrix show?",
            options: [
              "Model weights",
              "Prediction errors",
              "Hyperparameters",
              "Data distribution",
            ],
            correctAnswer: 1,
            explanation:
              "A confusion matrix shows true vs. predicted class results.",
          },
          {
            question: "Which algorithm is used for clustering?",
            options: [
              "Linear regression",
              "K-means",
              "Logistic regression",
              "Decision tree",
            ],
            correctAnswer: 1,
            explanation: "K-means is a common clustering algorithm.",
          },
          {
            question: "What does gradient descent optimize?",
            options: ["Loss function", "Accuracy", "Data size", "Features"],
            correctAnswer: 0,
            explanation: "Gradient descent minimizes the loss function.",
          },
          {
            question: "Which term describes model generalization to new data?",
            options: ["Bias", "Variance", "Robustness", "Overfitting"],
            correctAnswer: 2,
            explanation:
              "Robustness refers to good generalization on unseen data.",
          },
          {
            question:
              "Which library is widely used for deep learning in Python?",
            options: ["Pandas", "TensorFlow", "Scikit-learn", "Matplotlib"],
            correctAnswer: 1,
            explanation: "TensorFlow is a popular deep learning framework.",
          },
          {
            question: "What is the purpose of train/test split?",
            options: [
              "Increase data",
              "Measure generalization",
              "Optimize hyperparameters",
              "Clean data",
            ],
            correctAnswer: 1,
            explanation:
              "Train/test split helps validate model performance on unseen data.",
          },
          {
            question: "Which term describes input variables to a model?",
            options: ["Labels", "Features", "Targets", "Weights"],
            correctAnswer: 1,
            explanation: "Features are the input variables used by the model.",
          },
        ],
        passingScore: 70,
        creditsReward: 20,
      },
      {
        skillId: skills[3]._id,
        skillName: "Data Science Fundamentals",
        title: "Data Science Fundamentals Quiz",
        description:
          "Measure your data science knowledge across core tools and analysis.",
        difficulty: "Intermediate",
        questions: [
          {
            question:
              "Which library is commonly used for data frames in Python?",
            options: ["NumPy", "Pandas", "Requests", "Flask"],
            correctAnswer: 1,
            explanation: "Pandas provides DataFrame support for tabular data.",
          },
          {
            question: "What is the main goal of exploratory data analysis?",
            options: [
              "Build a model",
              "Prepare a report",
              "Understand patterns in data",
              "Deploy an app",
            ],
            correctAnswer: 2,
            explanation:
              "EDA helps uncover patterns and anomalies in the dataset.",
          },
          {
            question: "Which plot type is best for showing distribution?",
            options: ["Scatter plot", "Histogram", "Line chart", "Pie chart"],
            correctAnswer: 1,
            explanation: "Histograms show the distribution of numeric values.",
          },
          {
            question: "How does .dropna() help with data cleaning?",
            options: [
              "Removes duplicate values",
              "Fills missing values",
              "Drops missing rows",
              "Converts types",
            ],
            correctAnswer: 2,
            explanation: "dropna removes rows or columns with missing values.",
          },
          {
            question: "Which statistic is sensitive to outliers?",
            options: ["Median", "Mode", "Mean", "Range"],
            correctAnswer: 2,
            explanation: "The mean is affected by outliers.",
          },
          {
            question: "What does correlation measure?",
            options: [
              "Causation",
              "Relationship strength",
              "Data quality",
              "Variance",
            ],
            correctAnswer: 1,
            explanation:
              "Correlation measures the relationship between two variables.",
          },
          {
            question: "Which chart is best to compare categories?",
            options: ["Bar chart", "Heatmap", "Treemap", "Contour plot"],
            correctAnswer: 0,
            explanation:
              "Bar charts are ideal for comparing categorical values.",
          },
          {
            question: "What is a common file format for tabular data?",
            options: ["MP4", "CSV", "JPEG", "PDF"],
            correctAnswer: 1,
            explanation: "CSV is a common plain text tabular data format.",
          },
          {
            question: "What is a null value?",
            options: ["Zero", "Missing data", "Negative number", "A string"],
            correctAnswer: 1,
            explanation: "Null indicates missing or undefined data.",
          },
          {
            question: "Which package helps with statistical models in Python?",
            options: ["Matplotlib", "Scikit-learn", "Seaborn", "TensorFlow"],
            correctAnswer: 1,
            explanation:
              "Scikit-learn provides tools for machine learning and statistics.",
          },
        ],
        passingScore: 70,
        creditsReward: 18,
      },
      {
        skillId: skills[4]._id,
        skillName: "Full Stack MERN Development",
        title: "MERN Stack Quiz",
        description:
          "Test your knowledge of MongoDB, Express, React, and Node.js fundamentals.",
        difficulty: "Advanced",
        questions: [
          {
            question: "Which library is used to build the frontend in MERN?",
            options: ["Node.js", "Express", "React", "MongoDB"],
            correctAnswer: 2,
            explanation: "React is the frontend library in MERN.",
          },
          {
            question: "Which database is used in MERN?",
            options: ["MySQL", "PostgreSQL", "MongoDB", "SQLite"],
            correctAnswer: 2,
            explanation: "MongoDB is the database used in MERN.",
          },
          {
            question: "Which file defines server routes in Express?",
            options: ["server.js", "app.js", "index.js", "all of the above"],
            correctAnswer: 3,
            explanation:
              "Express routes can be defined in any JS file such as server.js or app.js.",
          },
          {
            question: "What is the purpose of package.json?",
            options: [
              "Store data",
              "List dependencies and scripts",
              "Render UI",
              "Handle HTTP",
            ],
            correctAnswer: 1,
            explanation:
              "package.json manages dependencies and scripts for a Node project.",
          },
          {
            question: "Which command installs a package with npm?",
            options: ["npm add", "npm install", "npm create", "npm run"],
            correctAnswer: 1,
            explanation: "npm install adds packages to the Node project.",
          },
          {
            question: "Which HTTP method is used to create data?",
            options: ["GET", "POST", "PUT", "DELETE"],
            correctAnswer: 1,
            explanation: "POST is typically used to create resources.",
          },
          {
            question: "What does JSX allow you to write in React?",
            options: ["SQL", "HTML-like markup", "CSS", "JSON"],
            correctAnswer: 1,
            explanation: "JSX lets you write HTML-like markup in JavaScript.",
          },
          {
            question: "Which command starts a React development server?",
            options: ["npm start", "npm run dev", "npm serve", "npm build"],
            correctAnswer: 0,
            explanation: "npm start is commonly used to start React apps.",
          },
          {
            question: "What role does Node.js play in MERN?",
            options: [
              "Database",
              "UI rendering",
              "Backend server",
              "CSS styling",
            ],
            correctAnswer: 2,
            explanation: "Node.js runs the backend server in MERN.",
          },
          {
            question: "Which command creates a new React project?",
            options: [
              "npx create-react-app",
              "npm new react",
              "node create-react",
              "react create app",
            ],
            correctAnswer: 0,
            explanation:
              "npx create-react-app initializes a new React application.",
          },
        ],
        passingScore: 70,
        creditsReward: 22,
      },
      {
        skillId: skills[5]._id,
        skillName: "React.js Essentials",
        title: "React Essentials Quiz",
        description:
          "A 10-question quiz covering core React concepts and component design.",
        difficulty: "Intermediate",
        questions: [
          {
            question: "What prop is used to pass data into a component?",
            options: ["props", "state", "context", "hooks"],
            correctAnswer: 0,
            explanation: "Props are used to pass data into a component.",
          },
          {
            question: "Which hook runs after every render?",
            options: ["useState", "useEffect", "useMemo", "useRef"],
            correctAnswer: 1,
            explanation:
              "useEffect runs after render when its dependencies change.",
          },
          {
            question: "Which property is required for list item keys?",
            options: ["key", "id", "name", "index"],
            correctAnswer: 0,
            explanation: "React requires a key prop on array list items.",
          },
          {
            question: "What is a controlled input?",
            options: [
              "Input without onChange",
              "Input managed by state",
              "Input with no value",
              "Input inside a form",
            ],
            correctAnswer: 1,
            explanation: "Controlled inputs use state to manage their value.",
          },
          {
            question: "How do you conditionally render content?",
            options: [
              "if (x) { return }",
              "x && <Component />",
              "case statement",
              "renderWhen",
            ],
            correctAnswer: 1,
            explanation: "Logical && can conditionally render elements in JSX.",
          },
          {
            question: "What type of component is defined as a function?",
            options: [
              "Class component",
              "Functional component",
              "Stateful component",
              "Pure component",
            ],
            correctAnswer: 1,
            explanation:
              "Functional components are plain JavaScript functions.",
          },
          {
            question: "Which hook adds state to a component?",
            options: ["useState", "useContext", "useReducer", "useEffect"],
            correctAnswer: 0,
            explanation:
              "useState is used to add state to a functional component.",
          },
          {
            question: "What is passed to a component as its arguments?",
            options: ["state", "props", "router", "hook"],
            correctAnswer: 1,
            explanation:
              "Props are passed into the component function as arguments.",
          },
          {
            question: "What is the default export in a React file?",
            options: [
              "A component",
              "A variable",
              "A constant",
              "A stylesheet",
            ],
            correctAnswer: 0,
            explanation: "React files typically default export a component.",
          },
          {
            question:
              "Which hook should be used to memoize expensive computations?",
            options: ["useState", "useMemo", "useLayoutEffect", "useCallback"],
            correctAnswer: 1,
            explanation:
              "useMemo memoizes values to avoid expensive recalculations.",
          },
        ],
        passingScore: 70,
        creditsReward: 18,
      },
      {
        skillId: skills[6]._id,
        skillName: "React Native Mobile Apps",
        title: "React Native Quiz",
        description:
          "A demo quiz for React Native fundamentals and mobile app patterns.",
        difficulty: "Intermediate",
        questions: [
          {
            question: "Which component is used to make touchable elements?",
            options: ["TouchableOpacity", "View", "Text", "Image"],
            correctAnswer: 0,
            explanation:
              "TouchableOpacity creates pressable UI in React Native.",
          },
          {
            question: "How do you define styles in React Native?",
            options: ["CSS files", "StyleSheet.create", "inline HTML", "SASS"],
            correctAnswer: 1,
            explanation: "StyleSheet.create defines styles in React Native.",
          },
          {
            question: "What does Flexbox control in React Native?",
            options: ["Layout", "State", "Networking", "Storage"],
            correctAnswer: 0,
            explanation: "Flexbox controls layout and alignment of components.",
          },
          {
            question: "Which component displays text?",
            options: ["TextInput", "Text", "Label", "Paragraph"],
            correctAnswer: 1,
            explanation: "Text displays readable text in React Native.",
          },
          {
            question:
              "Which library is often used for navigation in React Native?",
            options: ["React Navigation", "React Router", "Next.js", "Redux"],
            correctAnswer: 0,
            explanation:
              "React Navigation handles navigation in React Native apps.",
          },
          {
            question: "What value type does TextInput return?",
            options: ["string", "number", "boolean", "object"],
            correctAnswer: 0,
            explanation: "TextInput returns strings as the input value.",
          },
          {
            question: "Which prop adds margins around a component?",
            options: ["padding", "margin", "flex", "position"],
            correctAnswer: 1,
            explanation: "margin adds space outside the component.",
          },
          {
            question:
              "Which platform-specific file extension is used by React Native?",
            options: [".ios.js", ".native.js", ".web.js", ".js"],
            correctAnswer: 0,
            explanation:
              ".ios.js is one convention for platform-specific code.",
          },
          {
            question: "What is Expo used for in React Native?",
            options: [
              "Debugging",
              "Cloud hosting",
              "Tooling and build service",
              "Database",
            ],
            correctAnswer: 2,
            explanation:
              "Expo provides tooling and services for React Native apps.",
          },
          {
            question: "Which element is used to render an image?",
            options: ["Image", "Picture", "img", "Photo"],
            correctAnswer: 0,
            explanation: "Image renders images in React Native.",
          },
        ],
        passingScore: 70,
        creditsReward: 20,
      },
      {
        skillId: skills[7]._id,
        skillName: "JavaScript Fundamentals",
        title: "JavaScript Fundamentals Quiz",
        description:
          "A 10-question quiz covering core JavaScript concepts for beginners.",
        difficulty: "Beginner",
        questions: [
          {
            question: "Which keyword declares a block-scoped variable?",
            options: ["var", "let", "const", "both let and const"],
            correctAnswer: 3,
            explanation: "let and const both declare block-scoped variables.",
          },
          {
            question: "What does === check in JavaScript?",
            options: ["Value only", "Type only", "Value and type", "Neither"],
            correctAnswer: 2,
            explanation: "=== checks both value and type equality.",
          },
          {
            question: "Which method adds an item to the end of an array?",
            options: ["push()", "pop()", "shift()", "unshift()"],
            correctAnswer: 0,
            explanation: "push adds an element at the end of an array.",
          },
          {
            question: "What is the result of '5' + 3?",
            options: ["8", "53", "TypeError", "'5 3'"],
            correctAnswer: 1,
            explanation: "String concatenation occurs, producing '53'.",
          },
          {
            question: "Which keyword defines a function?",
            options: ["func", "function", "def", "lambda"],
            correctAnswer: 1,
            explanation: "function is used to define functions in JavaScript.",
          },
          {
            question: "What type of value does Math.random() return?",
            options: ["Integer", "Boolean", "Float", "String"],
            correctAnswer: 2,
            explanation:
              "Math.random returns a floating point number between 0 and 1.",
          },
          {
            question: "Which object gives access to the browser URL?",
            options: ["window", "document", "location", "navigator"],
            correctAnswer: 2,
            explanation: "location contains URL information in the browser.",
          },
          {
            question: "Which array method transforms each element?",
            options: ["map()", "filter()", "reduce()", "forEach()"],
            correctAnswer: 0,
            explanation: "map applies a function to each array element.",
          },
          {
            question: "What does JSON.stringify do?",
            options: [
              "Convert JSON to object",
              "Convert object to JSON string",
              "Parse JSON",
              "Validate JSON",
            ],
            correctAnswer: 1,
            explanation: "JSON.stringify converts values to a JSON string.",
          },
          {
            question: "Which keyword prevents reassignment of a variable?",
            options: ["const", "let", "var", "static"],
            correctAnswer: 0,
            explanation: "const defines a constant that cannot be reassigned.",
          },
        ],
        passingScore: 70,
        creditsReward: 15,
      },
      {
        skillId: skills[8]._id,
        skillName: "Kubernetes & Container Orchestration",
        title: "Kubernetes Fundamentals Quiz",
        description:
          "A demo quiz for Kubernetes concepts and container orchestration.",
        difficulty: "Advanced",
        questions: [
          {
            question: "What is a Kubernetes deployment used for?",
            options: [
              "Store data",
              "Manage replicated pods",
              "Monitor logs",
              "Configure network",
            ],
            correctAnswer: 1,
            explanation: "Deployments manage replicated pod lifecycles.",
          },
          {
            question: "What does a Service expose in Kubernetes?",
            options: [
              "A pod to external traffic",
              "A database",
              "A config file",
              "A volume",
            ],
            correctAnswer: 0,
            explanation: "Services provide stable networking for pods.",
          },
          {
            question: "Which object stores non-sensitive configuration data?",
            options: ["Secret", "ConfigMap", "Namespace", "PersistentVolume"],
            correctAnswer: 1,
            explanation: "ConfigMap stores non-sensitive config data.",
          },
          {
            question: "What is the smallest deployable unit in Kubernetes?",
            options: ["Deployment", "ReplicaSet", "Pod", "Container"],
            correctAnswer: 2,
            explanation: "A Pod is the smallest deployable unit.",
          },
          {
            question: "Which component runs on each Kubernetes node?",
            options: ["API Server", "kubelet", "etcd", "Scheduler"],
            correctAnswer: 1,
            explanation:
              "kubelet communicates with the API server and manages pods on nodes.",
          },
          {
            question: "What does Horizontal Pod Autoscaler adjust?",
            options: [
              "CPU limit",
              "Number of pod replicas",
              "Memory allocation",
              "Node count",
            ],
            correctAnswer: 1,
            explanation: "It adjusts pod replicas based on resource usage.",
          },
          {
            question: "What is the default namespace called?",
            options: ["default", "kube-system", "production", "namespace"],
            correctAnswer: 0,
            explanation: "default is the default namespace in Kubernetes.",
          },
          {
            question: "Which object describes a group of identical Pods?",
            options: ["Service", "ReplicaSet", "ConfigMap", "Ingress"],
            correctAnswer: 1,
            explanation: "ReplicaSet maintains a set of identical pods.",
          },
          {
            question: "What is used to route HTTP traffic into the cluster?",
            options: ["Service", "Ingress", "Pod", "Namespace"],
            correctAnswer: 1,
            explanation: "Ingress manages external HTTP and HTTPS access.",
          },
          {
            question: "Which command inspects cluster nodes?",
            options: [
              "kubectl get pods",
              "kubectl get nodes",
              "kubectl logs",
              "kubectl describe",
            ],
            correctAnswer: 1,
            explanation: "kubectl get nodes lists node information.",
          },
        ],
        passingScore: 75,
        creditsReward: 25,
      },
      {
        skillId: skills[9]._id,
        skillName: "Docker Basics",
        title: "Docker Basics Quiz",
        description:
          "A 10-question demo quiz for container fundamentals and Docker workflows.",
        difficulty: "Beginner",
        questions: [
          {
            question: "What is a Docker image?",
            options: [
              "Running container",
              "Template for containers",
              "Network rule",
              "Volume resource",
            ],
            correctAnswer: 1,
            explanation:
              "A Docker image is a template used to launch containers.",
          },
          {
            question: "Which command builds an image from a Dockerfile?",
            options: [
              "docker run",
              "docker build",
              "docker create",
              "docker compose",
            ],
            correctAnswer: 1,
            explanation: "docker build creates an image from a Dockerfile.",
          },
          {
            question: "What does docker run do?",
            options: [
              "Creates an image",
              "Starts a container",
              "Removes a volume",
              "Builds a file",
            ],
            correctAnswer: 1,
            explanation: "docker run starts a container from an image.",
          },
          {
            question: "Which file defines multi-container applications?",
            options: [
              "Dockerfile",
              "docker-compose.yml",
              "package.json",
              "Makefile",
            ],
            correctAnswer: 1,
            explanation:
              "docker-compose.yml defines multi-service applications.",
          },
          {
            question: "What is a Docker container?",
            options: [
              "A running process packaged with dependencies",
              "A database",
              "A VM image",
              "A configuration file",
            ],
            correctAnswer: 0,
            explanation:
              "Containers run packaged applications with their dependencies.",
          },
          {
            question: "Which command lists running containers?",
            options: [
              "docker ps",
              "docker images",
              "docker ls",
              "docker inspect",
            ],
            correctAnswer: 0,
            explanation: "docker ps lists running containers.",
          },
          {
            question: "Which flag maps a container port to the host port?",
            options: ["-v", "-p", "-d", "-it"],
            correctAnswer: 1,
            explanation: "-p publishes container ports to the host.",
          },
          {
            question: "What is dockerhub used for?",
            options: [
              "Local network",
              "Image registry",
              "Container runtime",
              "Log storage",
            ],
            correctAnswer: 1,
            explanation:
              "Docker Hub is a public registry for container images.",
          },
          {
            question: "What command removes a container?",
            options: ["docker rm", "docker rmi", "docker stop", "docker kill"],
            correctAnswer: 0,
            explanation: "docker rm removes stopped containers.",
          },
          {
            question: "Which option runs a container in the background?",
            options: ["-d", "-b", "-f", "-back"],
            correctAnswer: 0,
            explanation: "-d starts the container in detached mode.",
          },
        ],
        passingScore: 70,
        creditsReward: 15,
      },
      {
        skillId: skills[10]._id,
        skillName: "Want to Learn React",
        title: "React Fundamentals Quiz",
        description:
          "A demo quiz for learners getting started with React and frontend development.",
        difficulty: "Beginner",
        questions: [
          {
            question: "What is JSX?",
            options: [
              "A JavaScript syntax extension",
              "A CSS framework",
              "A backend language",
              "A database query tool",
            ],
            correctAnswer: 0,
            explanation:
              "JSX allows writing HTML-like syntax in React components.",
          },
          {
            question: "Which hook is used for local state in React?",
            options: ["useMemo", "useContext", "useState", "useEffect"],
            correctAnswer: 2,
            explanation: "useState adds state to functional components.",
          },
          {
            question: "How do you render a React component?",
            options: [
              "React.render()",
              "render()",
              "ReactDOM.render()",
              "ReactDOM.create()",
            ],
            correctAnswer: 2,
            explanation:
              "ReactDOM.render() renders a React element into the DOM.",
          },
          {
            question: "What does the key prop help with?",
            options: [
              "Styling elements",
              "Identifying list items",
              "Handling events",
              "Managing state",
            ],
            correctAnswer: 1,
            explanation:
              "Key helps React identify which items in a list have changed.",
          },
          {
            question: "Which prop type is commonly passed to a component?",
            options: ["value", "state", "props", "context"],
            correctAnswer: 2,
            explanation:
              "Props are how data is passed from parent to child components.",
          },
          {
            question: "What is a component in React?",
            options: [
              "A function or class returning UI elements",
              "An HTML file",
              "A database model",
              "A CSS stylesheet",
            ],
            correctAnswer: 0,
            explanation:
              "React components are functions or classes that return UI.",
          },
          {
            question:
              "Which file extension is commonly used for React components?",
            options: [".jsx", ".py", ".java", ".sql"],
            correctAnswer: 0,
            explanation: ".jsx files are commonly used for React components.",
          },
          {
            question: "What does useEffect do?",
            options: [
              "Manipulates DOM directly",
              "Runs side effects after rendering",
              "Stores state values",
              "Handles errors",
            ],
            correctAnswer: 1,
            explanation:
              "useEffect runs side effects after a component renders.",
          },
          {
            question: "How do you create a React app quickly?",
            options: [
              "npm create-react-app",
              "npx create-react-app",
              "react new app",
              "node create-react-app",
            ],
            correctAnswer: 1,
            explanation:
              "npx create-react-app initializes a new React project.",
          },
          {
            question: "Which package manages routing in many React apps?",
            options: ["react-router-dom", "express", "tailwindcss", "mongoose"],
            correctAnswer: 0,
            explanation:
              "react-router-dom is common for routing in React apps.",
          },
        ],
        passingScore: 70,
        creditsReward: 15,
      },
      {
        skillId: skills[11]._id,
        skillName: "Looking for Web Development Mentorship",
        title: "Web Development Concepts Quiz",
        description:
          "A demo quiz to evaluate knowledge of core web development practices.",
        difficulty: "Intermediate",
        questions: [
          {
            question: "What does HTML stand for?",
            options: [
              "HyperText Markup Language",
              "Hyperlink Text Management Language",
              "Home Tool Markup Language",
              "Hyper Transfer Markup Language",
            ],
            correctAnswer: 0,
            explanation: "HTML stands for HyperText Markup Language.",
          },
          {
            question: "Which language styles web pages?",
            options: ["JavaScript", "CSS", "Python", "SQL"],
            correctAnswer: 1,
            explanation: "CSS is used for styling HTML content.",
          },
          {
            question: "What is the purpose of JavaScript in web apps?",
            options: [
              "Structure content",
              "Style content",
              "Add interactivity",
              "Store data in database",
            ],
            correctAnswer: 2,
            explanation: "JavaScript adds dynamic behavior to web pages.",
          },
          {
            question: "Which HTTP method is used to request data?",
            options: ["POST", "GET", "PUT", "DELETE"],
            correctAnswer: 1,
            explanation: "GET requests data from a server.",
          },
          {
            question: "What is a responsive website?",
            options: [
              "Static layout",
              "Mobile-first design",
              "Adapts to screen sizes",
              "Uses tables for layout",
            ],
            correctAnswer: 2,
            explanation:
              "Responsive design adapts content to different screen sizes.",
          },
          {
            question: "Which CSS property changes element color?",
            options: ["font-size", "color", "margin", "display"],
            correctAnswer: 1,
            explanation: "The color property changes text color.",
          },
          {
            question: "What is a web API used for?",
            options: [
              "Store user data",
              "Provide data or services over HTTP",
              "Design layouts",
              "Build databases",
            ],
            correctAnswer: 1,
            explanation: "A web API provides data and services over HTTP.",
          },
          {
            question: "What is the DOM?",
            options: [
              "Database Object Model",
              "Document Object Model",
              "Design Object Manager",
              "Developer Object Method",
            ],
            correctAnswer: 1,
            explanation: "The DOM is the Document Object Model for web pages.",
          },
          {
            question: "Which tag is used for a clickable link?",
            options: ["<div>", "<span>", "<a>", "<button>"],
            correctAnswer: 2,
            explanation: "The anchor <a> tag creates hyperlinks.",
          },
          {
            question: "What is version control?",
            options: [
              "Tracking file changes",
              "Hosting websites",
              "Managing user accounts",
              "Creating databases",
            ],
            correctAnswer: 0,
            explanation:
              "Version control tracks changes to source code and files.",
          },
        ],
        passingScore: 70,
        creditsReward: 18,
      },
      {
        skillId: skills[12]._id,
        skillName: "Want to Master DevOps",
        title: "DevOps Foundations Quiz",
        description:
          "A demo quiz covering core DevOps tools, practices, and workflows.",
        difficulty: "Intermediate",
        questions: [
          {
            question: "What does CI/CD stand for?",
            options: [
              "Continuous Integration / Continuous Delivery",
              "Code Inspection / Code Deployment",
              "Cloud Infrastructure / Container Deployment",
              "Continuous Iteration / Continuous Design",
            ],
            correctAnswer: 0,
            explanation:
              "CI/CD stands for Continuous Integration and Continuous Delivery.",
          },
          {
            question: "Which tool is used for containerization?",
            options: ["Docker", "Git", "Jenkins", "VS Code"],
            correctAnswer: 0,
            explanation: "Docker is used to containerize applications.",
          },
          {
            question: "What is infrastructure as code?",
            options: [
              "Writing code for applications",
              "Managing infrastructure with configuration files",
              "Building mobile apps",
              "Creating website layouts",
            ],
            correctAnswer: 1,
            explanation:
              "Infrastructure as code manages infrastructure using code.",
          },
          {
            question: "Which service helps automate builds and tests?",
            options: ["Jenkins", "Photoshop", "Excel", "Slack"],
            correctAnswer: 0,
            explanation: "Jenkins automates build and test workflows.",
          },
          {
            question: "What does monitoring in DevOps provide?",
            options: [
              "Code formatting",
              "Application and system visibility",
              "Image editing",
              "Database backups",
            ],
            correctAnswer: 1,
            explanation:
              "Monitoring gives visibility into application and system health.",
          },
          {
            question: "What is a rollback?",
            options: [
              "A code review",
              "Returning to a previous deployment",
              "Merging branches",
              "Deploying new features",
            ],
            correctAnswer: 1,
            explanation: "A rollback reverts to a previous working version.",
          },
          {
            question:
              "Which practice improves software quality by frequent merging?",
            options: [
              "Branching",
              "Continuous integration",
              "Manual deployment",
              "Feature freezes",
            ],
            correctAnswer: 1,
            explanation:
              "Continuous integration frequently merges code to catch issues early.",
          },
          {
            question: "What is a deployment pipeline?",
            options: [
              "A code editor plugin",
              "A workflow for building, testing, and deploying software",
              "A database query",
              "A container runtime",
            ],
            correctAnswer: 1,
            explanation:
              "A deployment pipeline automates build, test, and deploy steps.",
          },
          {
            question:
              "Which concept focuses on quickly delivering small updates?",
            options: [
              "Waterfall",
              "Continuous delivery",
              "Big bang",
              "Manual release",
            ],
            correctAnswer: 1,
            explanation:
              "Continuous delivery emphasizes fast, frequent releases.",
          },
          {
            question: "What tool automates configuration management?",
            options: ["MySQL", "Ansible", "HTML", "CSS"],
            correctAnswer: 1,
            explanation:
              "Ansible automates configuration and deployment tasks.",
          },
        ],
        passingScore: 70,
        creditsReward: 20,
      },
      {
        skillId: skills[13]._id,
        skillName: "Learn Cloud Architecture with AWS",
        title: "AWS Cloud Architecture Quiz",
        description:
          "A quiz focused on cloud architecture fundamentals and AWS service basics.",
        difficulty: "Intermediate",
        questions: [
          {
            question: "What is AWS used for?",
            options: [
              "Video editing",
              "Cloud computing services",
              "Mobile apps",
              "Desktop software",
            ],
            correctAnswer: 1,
            explanation: "AWS provides cloud computing services.",
          },
          {
            question: "Which AWS service is used for object storage?",
            options: ["EC2", "S3", "RDS", "Lambda"],
            correctAnswer: 1,
            explanation: "Amazon S3 provides object storage.",
          },
          {
            question: "What is a virtual server in AWS called?",
            options: ["Bucket", "Instance", "Container", "Function"],
            correctAnswer: 1,
            explanation: "An EC2 instance is a virtual server in AWS.",
          },
          {
            question: "Which AWS service runs serverless functions?",
            options: ["EC2", "S3", "Lambda", "RDS"],
            correctAnswer: 2,
            explanation: "AWS Lambda runs serverless functions.",
          },
          {
            question: "What does VPC stand for?",
            options: [
              "Virtual Private Cloud",
              "Virtual Public Cloud",
              "Virtual Private Cluster",
              "Virtual Program Code",
            ],
            correctAnswer: 0,
            explanation: "VPC stands for Virtual Private Cloud.",
          },
          {
            question: "Which service offers managed relational databases?",
            options: ["S3", "EC2", "RDS", "CloudFront"],
            correctAnswer: 2,
            explanation: "Amazon RDS provides managed relational databases.",
          },
          {
            question: "What is a security group in AWS?",
            options: [
              "A database role",
              "A firewall rule set",
              "A compute instance type",
              "A storage bucket",
            ],
            correctAnswer: 1,
            explanation:
              "Security groups act as virtual firewalls for AWS resources.",
          },
          {
            question: "Which AWS service helps with DNS routing?",
            options: ["CloudWatch", "Route 53", "S3", "Lambda"],
            correctAnswer: 1,
            explanation: "Route 53 manages DNS routing in AWS.",
          },
          {
            question: "What is an AWS availability zone?",
            options: [
              "A database cluster",
              "A separate data center within a region",
              "A user group",
              "A serverless function",
            ],
            correctAnswer: 1,
            explanation:
              "Availability zones are isolated locations within an AWS region.",
          },
          {
            question: "Which service speeds up content delivery?",
            options: ["CloudWatch", "CloudFront", "S3", "IAM"],
            correctAnswer: 1,
            explanation: "CloudFront is AWS's content delivery network.",
          },
        ],
        passingScore: 70,
        creditsReward: 18,
      },
      {
        skillId: skills[14]._id,
        skillName: "Mobile Development Learning",
        title: "Mobile App Fundamentals Quiz",
        description:
          "A demo quiz for learners interested in building cross-platform mobile apps.",
        difficulty: "Beginner",
        questions: [
          {
            question: "What does 'React Native' help you build?",
            options: ["Web APIs", "Databases", "Mobile apps", "Desktop apps"],
            correctAnswer: 2,
            explanation: "React Native is used to build mobile apps.",
          },
          {
            question: "Which language is commonly used with React Native?",
            options: ["Python", "JavaScript", "Java", "Swift"],
            correctAnswer: 1,
            explanation: "JavaScript is used to build React Native apps.",
          },
          {
            question: "Which component displays text in React Native?",
            options: ["View", "Text", "Image", "Button"],
            correctAnswer: 1,
            explanation: "Text displays readable text in React Native apps.",
          },
          {
            question: "How do you style components in React Native?",
            options: [
              "CSS files",
              "StyleSheet.create",
              "HTML attributes",
              "XML styles",
            ],
            correctAnswer: 1,
            explanation:
              "StyleSheet.create is the standard for styling React Native.",
          },
          {
            question: "What is a common use for TouchableOpacity?",
            options: [
              "Display images",
              "Handle taps",
              "Store data",
              "Format text",
            ],
            correctAnswer: 1,
            explanation:
              "TouchableOpacity creates touchable buttons in React Native.",
          },
          {
            question: "What does 'Expo' provide for React Native?",
            options: [
              "Styling library",
              "Build and tooling support",
              "Database engine",
              "Server hosting",
            ],
            correctAnswer: 1,
            explanation:
              "Expo provides tools and services for React Native development.",
          },
          {
            question: "Which platform can React Native target?",
            options: ["iOS", "Android", "Both iOS and Android", "Web only"],
            correctAnswer: 2,
            explanation: "React Native can target both iOS and Android apps.",
          },
          {
            question: "Which component wraps layout in React Native?",
            options: ["StyleSheet", "View", "Text", "ScrollView"],
            correctAnswer: 1,
            explanation:
              "View is the basic container for layout in React Native.",
          },
          {
            question: "What is the default flex direction in React Native?",
            options: ["row", "column", "grid", "wrap"],
            correctAnswer: 1,
            explanation: "The default flex direction is column.",
          },
          {
            question: "What is required to run React Native code on a device?",
            options: [
              "A web browser",
              "A mobile simulator or device",
              "A database",
              "A server",
            ],
            correctAnswer: 1,
            explanation:
              "React Native apps run on simulators or physical devices.",
          },
        ],
        passingScore: 70,
        creditsReward: 15,
      },
    ]);
    console.log(`Created ${challenges.length} challenges`);

    // Create challenge attempts
    const attempts = await ChallengeAttempt.insertMany([
      {
        userId: users[0]._id,
        challengeId: challenges[0]._id,
        skillId: skills[0]._id,
        score: 85,
        passed: true,
        creditsEarned: 15,
        answers: [
          { questionIndex: 0, selectedAnswer: 0, correct: true },
          { questionIndex: 1, selectedAnswer: 3, correct: true },
          { questionIndex: 2, selectedAnswer: 0, correct: true },
        ],
      },
      {
        userId: users[2]._id,
        challengeId: challenges[1]._id,
        skillId: skills[1]._id,
        score: 90,
        passed: true,
        creditsEarned: 20,
        answers: [
          { questionIndex: 0, selectedAnswer: 1, correct: true },
          { questionIndex: 1, selectedAnswer: 1, correct: true },
        ],
      },
      {
        userId: users[2]._id,
        challengeId: challenges[2]._id,
        skillId: skills[2]._id,
        score: 78,
        passed: true,
        creditsEarned: 25,
        answers: [
          { questionIndex: 0, selectedAnswer: 0, correct: true },
          { questionIndex: 1, selectedAnswer: 0, correct: true },
          { questionIndex: 2, selectedAnswer: 1, correct: true },
        ],
      },
      {
        userId: users[6]._id,
        challengeId: challenges[3]._id,
        skillId: skills[3]._id,
        score: 65,
        passed: false,
        creditsEarned: 0,
        answers: [{ questionIndex: 0, selectedAnswer: 1, correct: false }],
      },
    ]);
    console.log(`Created ${attempts.length} challenge attempts`);

    // generate some login sessions for the first user (for analytics)
    {
      const Session = require("./models/Session");
      const now = Date.now();
      const sessionDocs = [];
      for (let i = 0; i < 20; i++) {
        const offset = Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000);
        sessionDocs.push({
          userId: users[0]._id,
          createdAt: new Date(now - offset),
        });
      }
      await Session.insertMany(sessionDocs);
      console.log(`Created ${sessionDocs.length} sessions for analytics`);
    }

    // Create wallets
    const wallets = await Wallet.insertMany([
      {
        userId: users[0]._id,
        credits: 500,
        totalEarned: 1000,
        totalSpent: 500,
      },
      {
        userId: users[2]._id,
        credits: 150,
        totalEarned: 200,
        totalSpent: 50,
      },
      {
        userId: users[2]._id,
        credits: 220,
        totalEarned: 300,
        totalSpent: 80,
      },
      {
        userId: users[6]._id,
        credits: 350,
        totalEarned: 500,
        totalSpent: 150,
      },
      {
        userId: users[6]._id,
        credits: 50,
        totalEarned: 50,
        totalSpent: 0,
      },
      {
        userId: users[6]._id,
        credits: 180,
        totalEarned: 250,
        totalSpent: 70,
      },
    ]);
    console.log(`Created ${wallets.length} wallets`);

    // Create payments
    const payments = await Payment.insertMany([
      {
        userId: users[0]._id,
        amount: 49.99,
        creditsGranted: 500,
        paymentMethod: "Credit Card",
        status: "Completed",
        transactionId: "PT_" + Date.now() + "_0",
        currency: "USD",
      },
      {
        userId: users[2]._id,
        amount: 9.99,
        creditsGranted: 100,
        paymentMethod: "Credit Card",
        status: "Completed",
        transactionId: "PT_" + Date.now() + "_1",
        currency: "USD",
      },
      {
        userId: users[2]._id,
        amount: 19.99,
        creditsGranted: 250,
        paymentMethod: "PayPal",
        status: "Completed",
        transactionId: "PT_" + Date.now() + "_2",
        currency: "USD",
      },
      {
        userId: users[6]._id,
        amount: 4.99,
        creditsGranted: 50,
        paymentMethod: "Apple Pay",
        status: "Completed",
        transactionId: "PT_" + Date.now() + "_3",
        currency: "USD",
      },
      {
        userId: users[6]._id,
        amount: 9.99,
        creditsGranted: 100,
        paymentMethod: "Credit Card",
        status: "Pending",
        transactionId: "PT_" + Date.now() + "_4",
        currency: "USD",
      },
      {
        userId: users[6]._id,
        amount: 29.99,
        creditsGranted: 350,
        paymentMethod: "Google Pay",
        status: "Completed",
        transactionId: "PT_" + Date.now() + "_5",
        currency: "USD",
      },
    ]);
    console.log(`Created ${payments.length} payments`);

    // Create transactions
    const transactions = await Transaction.insertMany([
      {
        userId: users[0]._id,
        type: "EARN",
        amount: 15,
        reason: "Challenge",
        description: "Completed Python Basics Quiz",
        status: "Completed",
      },
      {
        userId: users[2]._id,
        type: "EARN",
        amount: 20,
        reason: "Challenge",
        description: "Completed ML Concepts Challenge",
        status: "Completed",
      },
      {
        userId: users[2]._id,
        type: "EARN",
        amount: 25,
        reason: "Challenge",
        description: "Completed React Fundamentals Challenge",
        status: "Completed",
      },
      {
        userId: users[0]._id,
        type: "SPEND",
        amount: 10,
        reason: "Learning",
        description: "Enrolled in JavaScript course",
        status: "Completed",
      },
      {
        userId: users[2]._id,
        type: "EARN",
        amount: 100,
        reason: "Teaching",
        description: "Teaching React to Bob Smith",
        relatedUserId: users[0]._id,
        status: "Completed",
      },
      {
        userId: users[2]._id,
        type: "SPEND",
        amount: 50,
        reason: "Learning",
        description: "One-on-one mentoring session",
        status: "Completed",
      },
      {
        userId: users[6]._id,
        type: "EARN",
        amount: 15,
        reason: "Bonus",
        description: "Sign-up bonus",
        status: "Completed",
      },
      {
        userId: users[6]._id,
        type: "EARN",
        amount: 50,
        reason: "Teaching",
        description: "Teaching Kubernetes to multiple students",
        status: "Completed",
      },
    ]);
    console.log(`Created ${transactions.length} transactions`);

    // Create availability slots for demonstration
    // Generate dates for the next 30 days
    const today = new Date();
    const aliceAvailability = [];

    // Create availability slots for Alice (users[1]) - the teacher
    for (let i = 1; i <= 20; i++) {
      const slotDate = new Date(today);
      slotDate.setDate(slotDate.getDate() + i);

      // Skip Sundays
      if (slotDate.getDay() === 0) continue;

      // Create 2-3 slots per day at different times
      const timeSlots = [
        { start: "09:00", end: "10:30" },
        { start: "14:00", end: "15:30" },
        { start: "18:00", end: "19:30" },
      ];

      // Alternate which slots are available on each day
      const selectedSlots =
        i % 3 === 0
          ? [timeSlots[0], timeSlots[1]]
          : [timeSlots[1], timeSlots[2]];

      for (const slot of selectedSlots) {
        aliceAvailability.push({
          userId: users[2]._id,
          date: slotDate,
          startTime: slot.start,
          endTime: slot.end,
          isBooked: false,
        });
      }
    }

    await Availability.insertMany(aliceAvailability);
    console.log(
      `Created ${aliceAvailability.length} availability slots for Alice Johnson`,
    );

    // Create availability slots for other teachers (Bob, Carol, David, Emma)
    const otherTeachers = [
      { userId: users[2]._id, name: "Bob Smith" },
      { userId: users[6]._id, name: "Carol White" },
      { userId: users[6]._id, name: "David Brown" },
      { userId: users[6]._id, name: "Emma Davis" },
    ];

    let totalOtherSlots = 0;
    for (const teacher of otherTeachers) {
      const teacherAvailability = [];

      for (let i = 2; i <= 15; i++) {
        const slotDate = new Date(today);
        slotDate.setDate(slotDate.getDate() + i);

        // Skip Sundays
        if (slotDate.getDay() === 0) continue;

        // Each teacher has 1-2 slots per day
        const timeSlots = [
          { start: "10:00", end: "11:30" },
          { start: "15:00", end: "16:30" },
        ];

        const selectedSlots = i % 2 === 0 ? [timeSlots[0]] : [timeSlots[1]];

        for (const slot of selectedSlots) {
          teacherAvailability.push({
            userId: teacher.userId,
            date: slotDate,
            startTime: slot.start,
            endTime: slot.end,
            isBooked: false,
          });
        }
      }

      await Availability.insertMany(teacherAvailability);
      totalOtherSlots += teacherAvailability.length;
      console.log(
        `Created ${teacherAvailability.length} availability slots for ${teacher.name}`,
      );
    }

    console.log(
      `\n📅 Total availability slots created: ${aliceAvailability.length + totalOtherSlots}`,
    );

    console.log("\n✅ Database seeded successfully!");
    console.log("\n🔑 PRIMARY TEST ACCOUNT:");
    console.log("   Email: test@skillswap.com");
    console.log("   Password: 123456");
    console.log("\n📋 Additional Test Accounts:");
    users.slice(1).forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.name} (${user.email})`);
    });
    console.log("\n  Password for all other accounts: password123");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

// Run the seed function
connectDB().then(() => seedDatabase());
