const express = require("express");
const path = require("path");
const app = express();

require("./db/conn");
const Register = require("./models/registers");
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

app.get("/login", (req, res) =>{ // Services-Login Page
    res.render("login");
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

        const registered = await registerUser.save();
        res.status(201).render("dashboard");
        }
        else{
            res.send("Password are not matching")
        }
    }
        catch(error) {
            es.status(400).send(error);
        }   
})

app.get("/creators", (req, res) =>{ // Creators Page
    res.render("creators");
})

app.get("/about", (req, res) =>{ // About Page
    res.render("about");
})

app.get("/dashboard", (req, res) =>{ // Dashboard Page
    res.render("dashboard");
})


app.listen(port, () => {
    console.log(`server is running at Port no. ${port}`)
})