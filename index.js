require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

const app = express()

app.use(express.static('dist'))
app.use(express.json())
app.use(cors())

morgan.token('post-body', (request, response) => {
  if (request.method === 'POST') {
    return JSON.stringify(request.body)
  }
  return ''
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :post-body'))

const findAllPeople = async () => {
  const result = await Person.find({})
  return result
}

const findPersonById = async (id) => {
  const result = await Person.findById(id)
  return result
}

const savePerson = async (newPerson) => {
  const result = await newPerson.save()
  return result
}

const deletePersonById = async (id) => {
  const result = await Person.findByIdAndDelete(id)
  return result
}

const updatePersonById = async (id, updateData) => {
  const result = await Person.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
  return result
}

app.get('/api/people', async (request, response) => {
  const people = await findAllPeople()
  response.json(people)
})

app.get('/info', async (request, response) => {
  const date = new Date()
  const phonebook = await findAllPeople()
  response.send(`< p > Phonebook has info for ${phonebook.length} people</p > <p>${date}</p>`)
})

app.get('/api/people/:id', async (request, response, next) => {
  const id = request.params.id
  try {
    const person = await findPersonById(id)
    if (person) {
      response.json(person)
    } else {
      response.status(404).json({ error: 'Person not found' })
    }
  } catch (error) {
    next(error)
  }
})

app.delete('/api/people/:id', async (request, response, next) => {
  const id = request.params.id
  try {
    const person = await deletePersonById(id)
    if (person) {
      response.status(204).end()
    } else {
      response.status(404).json({ error: 'Person not found' })
    }
  } catch (error) {
    next(error)
  }
})

app.post('/api/people', async (request, response, next) => {
  const body = request.body
  if (!body.name) {
    response.status(400).json({ error: 'name missing' })
  } else if (!body.number) {
    response.status(400).json({ error: 'number missing' })
  } else {
    try {
      const savedPerson = await new Person({ name: body.name, number: body.number }).save()
      response.status(201).json(savedPerson)
    } catch (error) {
      next(error)
    }
  }
})

app.put('/api/people/:id', async (request, response, next) => {
  const id = request.params.id
  const body = request.body
  try {
    const person = await updatePersonById(id, body)
    if (person) {
      response.json(person)
    } else {
      response.status(404).json({ error: 'Person not found' })
    }
  } catch (error) {
    next(error)
  }
})

const errorHandler = (error, request, response, next) => {
  console.error(error.message)
  if (error.name === 'CastError') {
    response.status(400).json({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    response.status(400).json({ error: error.message })
  } else if (error.name === 'MongoError' && error.code === 11000) {
    response.status(400).json({ error: 'duplicate value error' })
  } else {
    response.status(500).json({ error: 'an unexpected error occurred' })
  }
}

app.use(errorHandler)

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} `)
})
