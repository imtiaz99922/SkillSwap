const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "skillswap_secret";

module.exports = function (req, res, next) {
  const authHeader =
    req.header("Authorization") ||
    req.header("authorization") ||
    req.header("x-auth-token");
  if (!authHeader)
    return res.status(401).json({ msg: "No token, authorization denied" });

  const token = authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : authHeader;
  if (!token)
    return res.status(401).json({ msg: "No token, authorization denied" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    req.user = { id: decoded.id }; // For consistency across routes
    next();
  } catch (e) {
    return res.status(401).json({ msg: "Token is not valid" });
  }
};
