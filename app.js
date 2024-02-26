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
  res.sendFile(path.join(__dirname, 'public', 'html', 'home.html'));
});

app.get('/student', authenticate, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'html', 'student.html'));
})

app.get('/professor', authenticate, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'html', 'professor.html'))
})

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'html', 'login.html'));
});

app.get('/student/create-assignment', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'html', 'create-assignment.html'));
})


app.get('/professor/get-students', authenticate, professorMiddleware, async (req, res) => {
  const result = await new Promise((resolve, reject) => {
    db.query('SELECT s.*, c.Name as Class FROM students s JOIN classes c ON c.Id=s.Class_id WHERE c.Professor_id = ? ORDER BY Class_id;', [[req.user.userId]], (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });

  return res.status(200).json(result)
})

app.get('/student/get-assignments', authenticate, async (req, res) => {
  const result = await new Promise((resolve, reject) => {
    db.query('SELECT a.*, p.State FROM assignments a JOIN participate p ON a.Id=p.Assignment_id WHERE p.Student_id=?;', [[req.user.userId]], (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });

  res.status(200).json(result)
})



app.post('/login', async (req, res) => {
  try {
      var { email, password } = req.body;
      email = email.toLowerCase()

      // Find the user by username in the database
      const result = await new Promise((resolve, reject) => {
        db.query('SELECT * FROM users WHERE Email = ?', [[email]], (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
      });
      if (result.length === 0) {
          return res.status(401).json({ error: 'Invalid email' });
      }

      const user = result[0];

      /*
      PASSWORD ENCRYPTION --- ADD IN PRODUCTION

      const passwordMatch = await bcrypt.compare(password, user.Password);
      */

      const passwordMatch = password == user.Password;

    
      if (!passwordMatch) {
          return res.status(401).json({ error: 'Invalid password' });
      }



      // Generate a JWT for authentication
      const token = jwt.sign({ userId: user.Id, type: user.Type }, JWT_SECRET, {
          expiresIn: '1y',
      });
      // Return the token to the client
      var url = ""
      await user.Type == "Student" ? url = "/student" : url = "/professor";
      res.json({ token: token, url: url });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/student/create-assignment', authenticate, async (req, res) => {
  const { name, hours, info, date } = req.body
  const assignment_id = uuidv4()
  const result = await new Promise((resolve, reject) => {
    db.query('INSERT INTO assignments (Id, Name, Hours, Info, Date, User_id) VALUES ?', [[[assignment_id, name, hours, info, date, req.user.userId]]], (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });

  await participate(assignment_id, req.user.userId);

  return res.redirect('/student');
})

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', '404.html'))
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

async function authenticate(req, res, next) {
  // Extract the token from the Authorization header
  try {
      const token = req.header('Authorization') || req.cookies.authToken;

      // Check if the token is provided
      if (!token) {
          return res.status(401).json({ error: 'Unauthorized - No token provided' });
          //return res.redirect('/login')
      }


      // Verify the token
      const decoded = jwt.verify(token, JWT_SECRET);

      const result = await new Promise((resolve, reject) => {
        db.query('SELECT * FROM users WHERE id = ?', [[decoded.userId]], (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
      });

      if (result.length === 0) {
          return res.status(401).json({ error: 'Unauthorized - User not found' });
          //return res.redirect('/login')
      }

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

async function professorMiddleware(req, res, next){
  return  req.user.type == "Professor" ? next(): res.status(403).json({ error: 'Access forbidden!' });
}

async function studentMiddleware(req, res, next){
  return  req.user.type == "Student" ? next(): res.status(403).json({ error: 'Access forbidden!' });
}

async function participate(assignment, student){
  const result = await new Promise((resolve, reject) => {
    db.query('INSERT INTO participate (Assignment_id, Student_id) VALUES ?', [[[assignment, student]]], (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });

  return result
}