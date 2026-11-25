// Load environment variables (MONGO_URI) from the private .env file
require("dotenv").config();
const mongoose = require("mongoose");

// ---------------------------------------------------------------------------
// 1. Connect to MongoDB Atlas using the URI stored in .env
// ---------------------------------------------------------------------------
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// ---------------------------------------------------------------------------
// 2. Person schema + model
// ---------------------------------------------------------------------------
const personSchema = new mongoose.Schema({
  name: { type: String, required: true }, // required field
  age: Number,
  favoriteFoods: [String], // array of strings
});

const Person = mongoose.model("Person", personSchema);

// ---------------------------------------------------------------------------
// 3. Create and save a single record
// ---------------------------------------------------------------------------
const createAndSavePerson = (done) => {
  // Build a document instance from the model constructor
  const person = new Person({
    name: "John",
    age: 30,
    favoriteFoods: ["pizza", "burritos"],
  });

  // save() with a Node-style callback (err, data)
  person.save((err, data) => {
    if (err) return done(err);
    done(null, data);
  });
};

// ---------------------------------------------------------------------------
// 4. Create many records with Model.create()
// ---------------------------------------------------------------------------
const createManyPeople = (arrayOfPeople, done) => {
  // create() takes an array of objects and saves them all
  Person.create(arrayOfPeople, (err, people) => {
    if (err) return done(err);
    done(null, people);
  });
};

// ---------------------------------------------------------------------------
// 5. Find all people with a given name -> [Person]
// ---------------------------------------------------------------------------
const findPeopleByName = (personName, done) => {
  Person.find({ name: personName }, (err, peopleFound) => {
    if (err) return done(err);
    done(null, peopleFound);
  });
};

// ---------------------------------------------------------------------------
// 6. Find one person who has a given food in favoriteFoods -> Person
// ---------------------------------------------------------------------------
const findOneByFood = (food, done) => {
  // Matching an array field against a single value matches any element
  Person.findOne({ favoriteFoods: food }, (err, personFound) => {
    if (err) return done(err);
    done(null, personFound);
  });
};

// ---------------------------------------------------------------------------
// 7. Find a person by _id -> Person
// ---------------------------------------------------------------------------
const findPersonById = (personId, done) => {
  Person.findById(personId, (err, personFound) => {
    if (err) return done(err);
    done(null, personFound);
  });
};

// ---------------------------------------------------------------------------
// 8. Classic update: find, edit, then save
// ---------------------------------------------------------------------------
const findEditThenSave = (personId, done) => {
  const foodToAdd = "hamburger";

  Person.findById(personId, (err, person) => {
    if (err) return done(err);
    if (!person) return done(new Error("Person not found"));

    // Edit the document in memory
    person.favoriteFoods.push(foodToAdd);
    // Not strictly needed because the type is [String], but harmless and
    // required if favoriteFoods were declared as an untyped (Mixed) array
    person.markModified("favoriteFoods");

    // Save the updated document inside the find callback
    person.save((err, updatedPerson) => {
      if (err) return done(err);
      done(null, updatedPerson);
    });
  });
};

// ---------------------------------------------------------------------------
// 9. findOneAndUpdate: set the age of a person found by name to 20
// ---------------------------------------------------------------------------
const findAndUpdate = (personName, done) => {
  const ageToSet = 20;

  Person.findOneAndUpdate(
    { name: personName }, // search criteria
    { age: ageToSet }, // update
    { new: true }, // return the updated document, not the original
    (err, updatedDoc) => {
      if (err) return done(err);
      done(null, updatedDoc);
    }
  );
};

// ---------------------------------------------------------------------------
// 10. Delete one document by _id
// ---------------------------------------------------------------------------
const removeById = (personId, done) => {
  // findByIdAndRemove passes the removed document to the callback
  Person.findByIdAndRemove(personId, (err, removedDoc) => {
    if (err) return done(err);
    done(null, removedDoc);
  });
};

// ---------------------------------------------------------------------------
// 11. Delete many documents: remove everyone named "Mary"
// ---------------------------------------------------------------------------
const removeManyPeople = (done) => {
  const nameToRemove = "Mary";

  // Model.remove() returns an outcome object (e.g. { deletedCount: n }),
  // not the deleted documents
  Person.remove({ name: nameToRemove }, (err, result) => {
    if (err) return done(err);
    done(null, result);
  });
};

// ---------------------------------------------------------------------------
// 12. Chain query helpers: people who like burritos, sorted by name,
//     limited to 2 results, with age hidden
// ---------------------------------------------------------------------------
const queryChain = (done) => {
  const foodToSearch = "burritos";

  Person.find({ favoriteFoods: foodToSearch }) // filter
    .sort({ name: 1 }) // ascending by name
    .limit(2) // only two documents
    .select({ age: 0 }) // hide the age field
    .exec((err, data) => {
      if (err) return done(err);
      done(null, data);
    });
};

// ---------------------------------------------------------------------------
// Demo runner: chains the operations so the whole checkpoint can be tried
// with `npm start` (only runs when this file is executed directly)
// ---------------------------------------------------------------------------
if (require.main === module) {
  const log = (label) => (err, data) => {
    if (err) {
      console.error(label, "ERROR:", err.message);
      return;
    }
    console.log(label, JSON.stringify(data));
  };

  createAndSavePerson((err, john) => {
    log("createAndSavePerson")(err, john);
    if (err) return mongoose.disconnect();

    createManyPeople(
      [
        { name: "Mary", age: 25, favoriteFoods: ["burritos", "sushi"] },
        { name: "Mary", age: 40, favoriteFoods: ["pasta"] },
        { name: "Alice", age: 22, favoriteFoods: ["burritos"] },
      ],
      (err, people) => {
        log("createManyPeople")(err, people);

        findPeopleByName("Mary", (err, data) => {
          log("findPeopleByName")(err, data);

          findOneByFood("pasta", (err, data) => {
            log("findOneByFood")(err, data);

            findPersonById(john._id, (err, data) => {
              log("findPersonById")(err, data);

              findEditThenSave(john._id, (err, data) => {
                log("findEditThenSave")(err, data);

                findAndUpdate("John", (err, data) => {
                  log("findAndUpdate")(err, data);

                  queryChain((err, data) => {
                    log("queryChain")(err, data);

                    removeById(john._id, (err, data) => {
                      log("removeById")(err, data);

                      removeManyPeople((err, data) => {
                        log("removeManyPeople")(err, data);
                        mongoose.disconnect(); // close the connection
                      });
                    });
                  });
                });
              });
            });
          });
        });
      }
    );
  });
}

// Export the model and functions so they can be tested
exports.PersonModel = Person;
exports.createAndSavePerson = createAndSavePerson;
exports.createManyPeople = createManyPeople;
exports.findPeopleByName = findPeopleByName;
exports.findOneByFood = findOneByFood;
exports.findPersonById = findPersonById;
exports.findEditThenSave = findEditThenSave;
exports.findAndUpdate = findAndUpdate;
exports.removeById = removeById;
exports.removeManyPeople = removeManyPeople;
exports.queryChain = queryChain;
