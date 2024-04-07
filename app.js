// Import necessary modules
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

// Initialize Express app
const app = express();
const PORT = 3000;

// Middleware to parse JSON bodies
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(express.urlencoded({extended: true}))
app.use(express.static(path.join(__dirname, 'public')));

let questions = []; 
let selectedQuestions = [];

// Read questions from the JSON file
fs.readFile('./data/questions.json', (err, data) => {
    if (err) {
        console.error('Error reading file:', err);
        return;
    }
    try {
        // Parse the JSON data into an array and store it in questions
        questions = JSON.parse(data);
        console.log('Questions loaded successfully');
    } catch (error) {
        console.error('Error parsing JSON:', error);
    }
});

// Function to select random questions
function selectRandomQuestions(questions, count) {
    const selectedQuestions = [];
    const totalQuestions = questions.length;

    // Generate random indices and select questions
    while (selectedQuestions.length < count) {
        const randomIndex = Math.floor(Math.random() * totalQuestions);
        const randomQuestion = questions[randomIndex];
        // Ensure the question is not already selected
        if (!selectedQuestions.includes(randomQuestion)) {
            selectedQuestions.push(randomQuestion);
        }
    }

    return selectedQuestions;
}

// Route to render the home page
app.get('/', (req, res) => {
    res.render('index.ejs');
});

// Route to render the quiz page with random questions
app.get('/quiz', (req, res) => {
    const qstns = selectRandomQuestions(questions, 10);
    selectedQuestions = qstns;
    res.render("quiz.ejs", {
        questions: qstns
    });
});

// Route to handle form submission and calculate score
app.post('/submit', (req, res) => {
    // Get user answers from the request body
    const userAnswers = req.body;

    // Initialize result array with questions
    const result = selectedQuestions;
    let score = 0;

    // Iterate over user answers and update result array
    for (let key in userAnswers) {
        let index = parseInt(key);
        if (index >= 0 && index < result.length) {
            result[index].userAnswer = userAnswers[key];
            result[index].correct = result[index].answer == result[index].userAnswer;
            if(result[index].correct)
                score++;
        }
    }

    // Render the submission result page with score and questions
    res.render('submit.ejs', {result: {
        score: score,
        questions: result
    }});
});

// Route to handle GET request to /submit by redirecting to home page
app.get('/submit', (req, res) => {
    res.redirect('/');
})

// Route to handle GET request to /home by redirecting to home page
app.get('/home', (req, res) => res.redirect('/'));

// Middleware to handle 404 errors
app.use((req, res, next) => {
    res.status(404).render("404.ejs");
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
