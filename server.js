const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { Schema } = mongoose;
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
app.use(express.json());
app.use(cors());

mongoose.connect('mongodb+srv://dhruvil:patel04@dhruvil.ldprohd.mongodb.net/mydatabase?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const noteSchema = new Schema({
  text: String,
});

const todoSchema = new Schema({
  title: String,
  notes: [noteSchema],
});

const Todo = mongoose.model('Todo', todoSchema);

const User = mongoose.model('User', {
  name: String,
  email: String,
  password: String
}, 'users');


app.post('/login', (req, res) => {
  const { email, password } = req.body;
  // Check if the user exists in the 'users' collection
  User.findOne({ email, password })
    .then((user) => {
      if (user) {
        res.status(200).json({ success: true }); // Authentication successful
      } else {
        res.status(401).json({ success: false }); // Authentication failed
      }
    })
    .catch((err) => {
      console.error('Failed to authenticate user', err);
      res.status(500).json({ success: false, message: 'An error occurred' });
    });
});

app.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
console.log('received name:',name)
console.log('received email:',email)
console.log('receivedpassword:',password)
  // Check if the user already exists in the 'users' collection
  User.findOne({ email })
    .then((user) => {
      if (user) {
        res.status(409).send('User already exists'); // User already exists
      } else {
        // Create a new user document
        const newUser = new User({
          name,
          email,
          password
        });

        // Save the new user
        newUser.save()
          .then(() => {
            res.status(200).json({ success: true });
          })
          .catch((err) => {
            console.error('Failed to save user:', err);
            res.sendStatus(500); // Internal server error
          });
      }
    })
    .catch((err) => {
      console.error('Failed to check user:', err);
      res.sendStatus(500); // Internal server error
    });
});

// Verify email route
app.get('/verify-email', async (req, res) => {
  const { email } = req.query;

  try {
    // Check if the email exists in the database
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'Email not found' });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Update password route
app.post('/update-password', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the email exists in the database
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'Email not found' });
    }

    // Update the password
    user.password = password;
    await user.save();

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.get('/api/todos', async (req, res) => {
  try {
    const todos = await Todo.find({});
    res.json(todos);
  } catch (error) {
    console.error('Error retrieving Todos:', error);
    res.status(500).send('Error retrieving Todos');
  }
});

app.post('/api/todos', async (req, res) => {
  try {
    const { title } = req.body;
    const todo = new Todo({
      title,
      notes: [],
    });
    const savedTodo = await todo.save();
    res.json(savedTodo);
  } catch (error) {
    console.error('Error adding Todo:', error);
    res.status(500).send('Error adding Todo');
  }
});

app.post('/api/todos/:id/notes', async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const updatedTodo = await Todo.findByIdAndUpdate(
      id,
      { $push: { notes: { _id: new mongoose.Types.ObjectId(), text } } },
      { new: true }
    );
    res.json(updatedTodo);
  } catch (error) {
    console.error('Error adding Note:', error);
    res.status(500).send('Error adding Note');
  }
});


app.put('/api/todos/:todoId/notes/:noteId', async (req, res) => {
  try {
    const { todoId, noteId } = req.params;
    const { text } = req.body;
    const updatedTodo = await Todo.findOneAndUpdate(
      { _id: todoId, 'notes._id': noteId },
      { $set: { 'notes.$.text': text } },
      { new: true }
    );
    res.json(updatedTodo);
  } catch (error) {
    console.error('Error editing Note:', error);
    res.status(500).send('Error editing Note');
  }
});

app.put('/api/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, notes } = req.body;
    const updatedTodo = await Todo.findByIdAndUpdate(
      id,
      { title, notes },
      { new: true }
    );
    res.json(updatedTodo);
  } catch (error) {
    console.error('Error updating Todo:', error);
    res.status(500).send('Error updating Todo');
  }
});

app.delete('/api/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Todo.findByIdAndRemove(id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting Todo:', error);
    res.status(500).json({ error: 'Error deleting Todo' });
  }
});


app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
