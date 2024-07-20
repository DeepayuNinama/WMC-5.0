const express = require("express");
const path = require("path");
const app = express();
require("./db/conn")

const port = process.env.PORT || 3000;

const static_path = path.join(__dirname, "../public" ); 
const templates_path = path.join(__dirname, "../templates/views" ); 

app.use(express.static(static_path)); 
app.set("view engine", "hbs"); 
app.set("views", templates_path);

// Landing Page
app.get("/", (req, res) =>{
    res.render("index")
});

// Services Page
app.get("/services", (req, res) =>{
    res.render("services");
})

// Creators Page
app.get("/creators", (req, res) =>{
    res.render("creators");
})

// About Page
app.get("/about", (req, res) =>{
    res.render("about");
})

app.listen(port, () => {
    console.log(`server is running at Port no. ${port}`)
})