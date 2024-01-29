const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const mysql = require('mysql')
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'dku';
const PORT = 3000

const db = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  port: 3306,
  password: '',
  database: 'dku',
  multipleStatements: true
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL: ' + err.stack);
    return;
  }
  console.log('Connected to MySQL.');
});

app.use(express.static(path.join("public")))
app.set('trust proxy', 1)
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
app.use(cookieParser())  

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'html', 'home.html'));
});


app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'html', 'login.html'));
});

app.get(' *', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', '404.html'))
})


app.post('/login', async (req, res) => {
  try {
      var { username, password } = req.body;
      username = username.toLowerCase()

      // Find the user by username in the database
      const result = await client.query('SELECT * FROM users WHERE username = $1', [username]);

      if (result.rows.length === 0) {
          return res.status(401).json({ error: 'Invalid username or password' });
      }

      const user = result.rows[0];

      // Compare the provided password with the hashed password
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
          return res.status(401).json({ error: 'Invalid username or password' });
      }

      // Generate a JWT for authentication
      const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, {
          expiresIn: '1y',
      });
      // Return the token to the client
      var url = "/home"
      await checkActivation(user.id) ? url = "/home" : url = "/activate";
      res.json({ token: token, url: url });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/signup', async (req, res) => {
  try {
      var { username, password } = req.body;
      username = username.toLowerCase()
      console.log(username, password)

      // Check if username already exists in the database
      const existingUser = await client.query('SELECT * FROM users WHERE username = $1', [username]);

      if (existingUser.rows.length > 0) {
          return res.status(400).json({ error: 'Username already exists' });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert the new user into the database
      const result = await client.query('INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id', [
          username,
          hashedPassword
      ]);
      const token = jwt.sign({ userId: result.rows[0].id, username: username }, JWT_SECRET, {
          expiresIn: '1y',
      });
      res.json({ token });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

async function authenticate(req, res, next) {
  if (req.body) console.log("body", req.body)
  // Extract the token from the Authorization header
  try {
      const token = req.header('Authorization') || req.cookies.authToken;
      console.log("Token", token, req.header('Authorization'))

      // Check if the token is provided
      if (!token) {
          return res.status(401).json({ error: 'Unauthorized - No token provided' });
          //return res.redirect('/login')
      }


      // Verify the token
      const decoded = jwt.verify(token, JWT_SECRET);

      // Check if the user exists in the database
      const result = await client.query('SELECT * FROM users WHERE id = $1', [decoded.userId]);

      if (result.rows.length === 0) {
          return res.status(401).json({ error: 'Unauthorized - User not found' });
          //return res.redirect('/login')
      }

      console.log(result.rows)

      // Attach the user information to the request object for further use in routes
      req.user = decoded;

      // Continue to the next middleware or route handler
      next();
  } catch (error) {
      console.error(error);
      return res.status(401).json({ error: 'Unauthorized - Invalid token' });
      //return res.redirect('/login')
  }
}