const express = require("express");
const app = express();
const userModel = require("./models/user");
const postModel = require("./models/post");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/register", async (req, res) => {
  const { email, password, username, name, age } = req.body;

  let user = await userModel.findOne({ email });
  if (user) return res.status(500).send("User already registered");

  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, async (err, hash) => {
      let user = userModel.create({
        username,
        email,
        age,
        name,
        password: hash,
      });

      const token = jwt.sign({ email, userId: user._id }, "secret");
      res.cookie("secret-token", token);
      res.send("Registration Done!");
    });
  });
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  let user = await userModel.findOne({ email });
  if (!user) return res.status(500).send("Something went wrong");

  bcrypt.compare(password, user.password, (err, result) => {
    if (result) {
      let token = jwt.sign({ email: user.email }, "secret");
      res.cookie("secret-token", token);
      res.status(200).send("Login Successful");
    } else res.redirect("/login");
  });
});

app.get("/logout", async (req, res) => {
  res.cookie("secret-token", "");
  res.redirect("login");
})

app.listen(3000);
