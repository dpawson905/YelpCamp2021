const crypto = require("crypto");

const User = require("../models/user");
const Token = require("../models/token");
const Email = require("../utils/email");
const emailUrl = require("../utils/urls");
const helpers = require("../utils/helpers");

module.exports.renderRegister = (req, res) => {
  res.render("users/register");
};

module.exports.register = async (req, res, next) => {
  try {
    const { email, username, password } = req.body;
    const user = new User({
      email,
      username,
      expiresDateCheck: Date.now(),
      isVerified: false,
    });
    const registeredUser = await User.register(user, password);
    const userToken = new Token({
      _userId: user._id,
      token: crypto.randomBytes(16).toString("hex"),
    });
    await userToken.save();
    const url = emailUrl.setUrl(
      req,
      "verify",
      `token?token=${userToken.token}`
    );
    await new Email(registeredUser, url).sendWelcome("Hello");
    req.flash("success", "Check your email to verify your account");
    return res.redirect("/");
  } catch (e) {
    console.log("Message: ", e.message);
    helpers.removeFailedUser(User, req.body.email);
    req.flash("error", e.message);
    return res.redirect("register");
  }
};

module.exports.verifyFromEmail = async (req, res, next) => {
  const token = await Token.findOne({
    token: req.query.token,
  });
  if (!token) {
    req.flash("error", "That token is not valid");
    return res.redirect("/");
  }
  const user = await User.findOne({ _id: token._userId });
  user.isVerified = true;
  user.expiresDateCheck = undefined;
  await user.save();
  await token.remove();
  await req.login(user, (err) => {
    if (err) return next(err);
    req.flash("success", `Welcome to ${res.locals.title} ${user.username}`);
    const redirectUrl = req.session.redirectTo || "/campgrounds";
    delete req.session.redirectTo;
    res.redirect(redirectUrl);
  });
};

module.exports.renderLogin = (req, res) => {
  res.render("users/login");
};

module.exports.login = (req, res) => {
  req.flash("success", "welcome back!");
  const redirectUrl = req.session.returnTo || "/campgrounds";
  delete req.session.returnTo;
  res.redirect(redirectUrl);
};

module.exports.logout = (req, res) => {
  req.logout();
  // req.session.destroy();
  req.flash("success", "Goodbye!");
  res.redirect("/campgrounds");
};
