const express = require("express");
const path = require("path");
const app = express();
const bcrypt = require("bcryptjs");

require("./db/conn");
const Register = require("./models/registers");

const Product = require("./models/products");

const { json } = require("express");
const port = process.env.PORT || 3000;


app.use(express.json());
app.use(express.urlencoded({extended:false}));

const static_path = path.join(__dirname, "../public" ); 
const templates_path = path.join(__dirname, "../templates/views" ); 

app.use(express.static(static_path)); 
app.set("view engine", "hbs"); 
app.set("views", templates_path);

app.get("/", (req, res) =>{ // Landing Page
    res.render("index")
});

app.get("/login", (req, res) =>{ // Services-Login Page // GET
    res.render("login");
})

app.post("/login", async(req, res) =>{ // Services-Login Page // POST
    
    try {
        const email = req.body.email;
        const password = req.body.password;

        const useremail = await Register.findOne({emailid:email});

        const isMatch = await bcrypt.compare(password, useremail.password);

        if(isMatch){
            res.status(201).render("dashboard");
        }
        else{
            res.send("Password does not Match");
        }
    } 
    catch (error) {
        res.status(400).send("Login Failed");
    }
})

app.get("/register", (req, res) =>{ // Services-Signup Page
    res.render("register");
})

app.post("/register", async(req, res) =>{ // Creating New user in DB
    try{
        const password = req.body.password;
        const cpassword = req.body.confirmpassword;

        if(password===cpassword){
            const registerUser = new Register({
                firstname : req.body.firstname,
                lastname : req.body.lastname,
                emailid : req.body.emailid,
                password : password,
                confirmpassword : cpassword
            })

            // Password Hash


        const registered = await registerUser.save();
        res.status(201).render("dashboard");
        }
        else{
            res.send("Password are not matching")
        }
    }
        catch(error) {
            res.status(400).send(error);
        }   
})

app.get("/creators", (req, res) =>{ // Creators Page
    res.render("creators");
})

app.get("/about", (req, res) =>{ // About Page
    res.render("about");
})

// app.get("/dashboard", (req, res) =>{ // Dashboard Page
//     res.render("dashboard");
// })

app.get("/dashboard", async (req, res) => {
    try {
        const products = await Product.find({});
        res.render("dashboard", { products });
    } catch (error) {
        res.status(500).send("Error retrieving products");
    }
});


app.listen(port, () => {
    console.log(`server is running at Port no. ${port}`)
})