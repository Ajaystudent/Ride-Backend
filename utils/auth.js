import jwt from "jsonwebtoken";
const secret = 'effcd4196eb05487f634d4bcd7b2bce7dabcf165a972325355f3d5a59aef50db';

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer")) {
      return res.send("Authentication invalid");
    }
    const token = authHeader.split(" ")[1];
    const payload = jwt.verify(token, secret);
    req.user = { userId: payload.userId,userType:payload.userType };
    next();
  } catch (error) {
    console.log("error", error);
    return res.send("Authentication invalid");
  }
};
export default auth;