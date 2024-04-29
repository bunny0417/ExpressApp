const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const session = require('express-session');
const connectDB = require('../src/db_connect/connect');
const User = require('../src/models/MongoSchema');
const multer = require('multer');

const app = express();
const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`Server is running at PORT: ${port}`));

connectDB();

const uploadDir = path.join(__dirname, '../uploads');

const storage = multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => cb(null, file.originalname)
});

const upload = multer({ storage });

app.set("view engine", "hbs");
app.set('views', path.join(__dirname, '../src/public/views'));
app.use(express.static('public'));

app.use('/css', express.static(path.join(__dirname, '../src/public/views/css')));
app.use('/uploads', express.static(uploadDir));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({ secret: 'your_secret_here', resave: false, saveUninitialized: true }));

const authenticate = (req, res, next) => {
    if (req.session && req.session.authenticated) {
        return next(); // Proceed if authenticated
    } else {
        return res.redirect("/"); // Redirect to login portal if not authenticated
    }
};

const authenticateAdmin = (req, res, next) => {
    if (req.session && req.session.authenticated && req.session.isAdmin) {
        return next(); // Proceed if authenticated and isAdmin is true
    } else {
        return res.redirect("/adminlogin"); // Redirect to admin login if not authenticated as admin
    }
};

app.get("/uploads/:filename", authenticate, (req, res) => {
    const fileName = req.params.filename;
    res.sendFile(path.join(uploadDir, fileName));
});

app.get("/", (req, res) => req.session && req.session.authenticated ? res.redirect("/user") : res.render("login"));
app.get("/adminlogin", (req, res) => req.session && req.session.authenticated ? res.redirect("admin") : res.render("adminlogin"));
// Admin login route
app.get("/adminlogin", (req, res) => {
    res.render("adminlogin");
});

// Handle admin login
app.post("/adminlogin", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.send("User not found");
        if (password !== user.password) return res.send("Incorrect password");

        req.session.authenticated = true;
        req.session.isAdmin = user.isAdmin; // Set isAdmin property in session

        if (user.isAdmin) {
            res.redirect("/admin");// Redirect admin to admin portal
        } else {
            res.redirect("/adminlogin");
        }
    } catch (error) {
        console.error("Error logging in:", error);
        res.status(500).send("Error logging in");
    }
});

app.get("/register", (req, res) => res.render("register"));

app.get("/user", authenticate, async (req, res) => {
    try {
        const users = await User.find({});
        res.render("user", { users });
    } catch (error) {
        res.status(500).send("Error fetching from DB");
    }
});
app.get("/admin", authenticate, async (req, res) => {
    try {
        const users = await User.find({});
        res.render("admin", { users });
    } catch (error) {
        res.status(500).send("Error fetching from DB");
    }
});
app.get("/adminlogin", authenticate, async (req, res) => {
    try {
        const users = await User.find({});
        res.render("admin", { users });
    } catch (error) {
        res.status(500).send("Error fetching from DB");
    }
});
app.post("/register", upload.single('profile_picture'), async (req, res) => {
    try {
        const newUser = new User({
            ...req.body,
            profile_picture: req.file ? `/uploads/${req.file.filename}` : '',
            declaration: req.body.declaration === 'true',
            timestamp: new Date()
        });

        const existingUser = await User.findOne({ email: newUser.email });
        if (existingUser) return res.send('User already exists. Please choose a different email.');

        await newUser.save();
        res.redirect("/admin");
    } catch (error) {
        console.error(error);
        res.status(400).send(error);
    }
});

app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.send("User not found");
        if (password !== user.password) return res.send("Incorrect password");

        req.session.authenticated = true;

        if (user.isAdmin) {
            res.redirect("/admin");
        } else {
            res.redirect("/user");
        }
    } catch (error) {
        console.error("Error logging in:", error);
        res.status(500).send("Error logging in");
    }
});

// Admin route
app.get("/admin", authenticateAdmin, async (req, res) => {
    try {
        const users = await User.find({}); // Fetch all users from the database
        res.render("admin", { users }); // Render admin page with users data
    } catch (error) {
        console.error("Error rendering admin page:", error);
        res.status(500).send("Error rendering admin page");
    }
});



app.get("/update/:id", authenticate, async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).send("User not found");
        }

        res.render("update", { user });
    } catch (error) {
        console.error("Error rendering update form:", error);
        res.status(500).send("Error rendering update form");
    }
});

app.post("/update/:id", async (req, res) => {
    try {
        const userId = req.params.id;
        const updatedUserData = req.body;

        await User.findByIdAndUpdate(userId, updatedUserData);

        res.redirect("/admin");
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).send("Error updating user");
    }
});

app.get('/logout', (req, res) => {
    // Destroy the session
    req.session.destroy(err => {
        if (err) {
            console.error('Error destroying session:', err);
            res.status(500).send('Error destroying session');
        } else {
            // Redirect to login page or any other page after logout
            res.redirect('/'); // Change '/login' to your desired logout route
        }
    });
});

// GET request handler for rendering the delete confirmation page
// Existing code...

// Route to handle user deletion
app.get("/delete/:id", authenticate, async (req, res) => {
    try {
        const userId = req.params.id;
        await User.findByIdAndDelete(userId);
        res.redirect("/admin");
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).send("Error deleting user");
    }
});

// Existing code...


// POST request handler for deleting the user
// Route to handle user deletion
app.post("/delete/:id", authenticate, async (req, res) => {
    try {
        const userId = req.params.id;
        await User.findByIdAndDelete(userId);
        res.send({ message: "User deleted successfully" });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).send("Error deleting user");
    }
});


