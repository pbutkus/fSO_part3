const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static("dist"));

morgan.token("post-body", (request, response) => {
    if (request.method === "POST") {
        return JSON.stringify(request.body);
    }

    return "";
});

app.use(morgan(":method :url :status :res[content-length] - :response-time ms :post-body"));

let phonebook = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
];

app.get("/api/persons", (request, response) => {
    response.json(phonebook);
});

app.get("/info", (request, response) => {
    const date = new Date;

    response.send(`
            <p>Phonebook has info for ${phonebook.length} people</p>
            <p>${date}</p>
        `);
});

app.get("/api/persons/:id", (request, response) => {
    const id = Number(request.params.id);
    const person = phonebook.find(person => person.id === id);

    if (person) {
        response.json(person);
    } else {
        response.status(404).send("Person not found")
    }
    
});

app.delete("/api/persons/:id", (request, response) => {
    const id = Number(request.params.id);
    const person = phonebook.find(person => person.id === id);
    phonebook = phonebook.filter(person => person.id !== id);

    if (person) {
        response.status(204).end();
    } else {
        response.status(404).send("Person not found");
    }
});

app.post("/api/persons", (request, response) => {
    const newPerson = request.body;
    newPerson.id = Math.floor(Math.random() * 1000) + 4;

    const filteredPhonebook = phonebook.filter(person => person.name === newPerson.name);

    if (filteredPhonebook.length > 0) {
        response.status(409).json({ error: "name must be unique" });
    } else if (!newPerson.name) {
        response.status(400).json({ error: "name missing" });
    } else if (!newPerson.number) {
        response.status(400).json({ error: "number missing" });
    } else {
        phonebook.push(newPerson);
        response.status(201).json(newPerson);
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});