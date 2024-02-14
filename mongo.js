const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('give passwords as argument')
  process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://fsopenpart3:${encodeURIComponent(password)}@cluster0.twnq6q0.mongodb.net/phonebookApp?retryWrites=true&w=majority`

mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

const savePerson = async (newPerson) => {
  try {
    const result = await newPerson.save()
    console.log(`added ${newPerson.name} number ${newPerson.number} to phonebook`)
    mongoose.connection.close()
  } catch (error) {
    console.error('Error saving person: ', error)
    mongoose.connection.close()
  }
}

const findAllPeople = async () => {
  try {
    const result = await Person.find({})
    result.forEach(person => {
      console.log(person)
    })
    mongoose.connection.close()
  } catch (error) {
    console.error('Error finding people: ', error)
    mongoose.connection.close()
  }
}

if (process.argv.length === 3) {
  findAllPeople()
}

if (process.argv.length === 5) {
  const person = new Person({
    name: process.argv[3],
    number: process.argv[4],
  })

  savePerson(person)
}