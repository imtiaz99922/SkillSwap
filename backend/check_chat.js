const mongoose = require("mongoose");
const ChatMessage = require("./models/ChatMessage");
const User = require("./models/User");

const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/skillswap";

async function main() {
  try {
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  } catch (err) {
    console.log(
      "Primary connect failed, falling back to in-memory",
      err.message,
    );
    const { MongoMemoryServer } = require("mongodb-memory-server");
    const mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri(), {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }

  const count = await ChatMessage.countDocuments();
  const priv = await ChatMessage.countDocuments({ messageType: "private" });
  const pub = await ChatMessage.countDocuments({ messageType: "global" });
  console.log({ total: count, private: priv, global: pub });
  const messages = await ChatMessage.find({ messageType: "private" })
    .limit(10)
    .lean();
  console.log(messages);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
