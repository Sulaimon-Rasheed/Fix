const express = require("express");
const middleware = require("./middleware.user");
const controller = require("./controller.user");
const cookieParser = require("cookie-parser");
const { v4: uuidv4 } = require("uuid");
const transpo = require("../util/nodemailer");
const userVerificationModel = require("../models/userVerification");
const bcrypt = require("bcrypt");
const userModel = require("../models/user");
const userRouter = express.Router();
// const flash = require("connect-flash")

userRouter.use(cookieParser());
// userRouter.use(flash())
userRouter.post("/signup", middleware.validateUser, async (req, res) => {
  const response = await controller.createUser({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
    verified: "false",
  });
  if (response.code === 200) {
    
    sendVerificationEmail(response.newUser,res);
    
  } else {
    res.redirect("/existingUser");
  }
});

// Defining the function to send verification email
const sendVerificationEmail = async ({ _id, username, email },res) => {
  const currUrl = "https://fix-and-do.onrender.com";
  const uniqueString = uuidv4() + _id;
  const hashUniqueString = await bcrypt.hash(uniqueString, 10);
  const uniqueStringExpireTime = Date.now() + 21600000;
  const option = {
    subject: "Verify your email",
    email: email,
    html: `<p>Hi, ${username}</p>
        <p>Thank you for signing up to Fix</p>
        <p>Click the link below to get authorized</p>
        <P>${currUrl + "/users/verify/" + uniqueString + "/" + _id}</p>
        <P>The link will expire in the next 6hrs</p>
        `,
  };

  const userverification = await userVerificationModel.create({
    uniqueString: hashUniqueString,
    uniqueStringExpireTime: uniqueStringExpireTime,
    userId: _id,
  });

  if (!userverification) {
    let message = "An error occured. Try again later";
    res.redirect(`/serverError/${message}`);
  }

  await transpo.sendEmail(option, (err) => {
    if (err) {
      res.redirect(`/serverError/${err.message}`);
    }
  });
  let message = `Thank you ${username} for signing up to Fix`
  res.redirect(`/successfulSignup/${message}`);
};

// Handling the email get request
userRouter.get("/verify/:uniqueString/:id", async (req, res) => {
  try {
    const { uniqueString, id } = req.params;
    const user = await userVerificationModel.findOne({ userId: id });
    if (!user) {
      let message =
        "Please, you are not found.Signup again";
      res.redirect(`/errorHandler/${message}`);
      return;
    }

    if (user.uniqueStringExpireDate < Date.now()) {
      await userVerificationModel.deleteOne({userId:id})
      await userModel.deleteOne({_id:id})
      let message = "Your verification link has expired. You can signup again";
      res.redirect(`/errorHandler/${message}`);
      return;
    }

    const compare = await bcrypt.compare(uniqueString, user.uniqueString);
    if (!compare) {
      let message =
        "It seems you altered your verification string.Check and try again 2";
      return res.redirect(`/errorHandler/${message}`);
    }

    const foundUser = await userModel.findOne({ _id: id });
    foundUser.verified = "true";
    foundUser.save();

    await userVerificationModel.deleteOne({userId:id})

    let message = "Verification Successful"
    return res.redirect(`/successfulVerification/${message}`);

  } catch (err) {
    return res.redirect(`/serverError/${err.message}`);
  }
});

// Handling the Login request
userRouter.post("/login", middleware.validateLogInfo, async (req, res) => {
  const response = await controller.login({
    email: req.body.email,
    password: req.body.password,
  });
  if (response.code === 200) {
    res.cookie("jwt", response.token, { maxAge: 60 * 60 * 1000 });
    res.redirect("/dashboard");
  } else if (response.code === 404) {
    //user does not exist
    res.redirect("/userNotFound");
  } else if(response.code === 422) {                
    // username or password is incorrect
    res.redirect("/invalidInfo");
    
  } else if(response.code === 403) {
     //user not verified
     return res.redirect(`/errorHandler/${response.message}`);
  }
   else {
    let message = "An error occured"
     res.redirect(`/serverError/${message}`);
  }
});

module.exports = userRouter;
