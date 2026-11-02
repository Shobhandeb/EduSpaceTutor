const express = require('express');
const app = express();
const PORT = 3000;

// Tell Express to use EJS (Embedded JavaScript) for our HTML templates
app.set('view engine', 'ejs');

// Tell Express where to find public files like CSS and images
app.use(express.static('public'));

// Create a route for the Home Page
app.get('/', (req, res) => {
    res.render('home');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running! Open your browser and go to http://localhost:${PORT}`);
});