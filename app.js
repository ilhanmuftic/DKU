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

app.use('/student', authenticate, studentMiddleware)
app.use('/professor', authenticate, professorMiddleware)

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'html', 'home.html'));
});

app.get('/student', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'html', 'student.html'));
})

app.get('/professor',  (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'html', 'professor.html'))
})

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'html', 'login.html'));
});

app.get('/student/create-assignment',  (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'html', 'create-assignment.html'));
})

app.get('/professor/create-assignment', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'html', 'create-assignment.html'));
})


app.get('/professor/get-students', async (req, res) => {
  const results = await new Promise((resolve, reject) => {
    db.query(`SELECT s.*, c.Name AS Class, 
    CONCAT('[', GROUP_CONCAT(
        CONCAT('{ "Id": "', p.Id, '", "Name": "', a.Name, '", "State": "', p.State, '", "Date": "', a.Date , '"}')
        ORDER BY CASE WHEN p.State = 'pending' THEN 0 ELSE 1 END, a.Date DESC SEPARATOR ', '), ']') AS Assignments
      FROM students s 
      JOIN classes c ON c.Id = s.Class_id 
      LEFT JOIN participate p ON s.Id = p.Student_id
      LEFT JOIN assignments a ON p.Assignment_id = a.Id
      WHERE c.Professor_id = ?
      GROUP BY s.Id, c.Id
      ORDER BY s.Class_id;

`, [[req.user.userId]], (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });

  results.forEach(result => {
    result.Assignments = JSON.parse(result.Assignments)
  });

  return res.status(200).json(results)
})

app.get('/student/get-assignments', async (req, res) => {
  const result = await new Promise((resolve, reject) => {
    db.query('SELECT a.* FROM assignments a JOIN visibility v ON a.Id = v.Assignment_id JOIN students s ON v.Class = s.Class_id WHERE s.Id = ? ORDER BY Date DESC;', [[req.user.studentId]], (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });

  res.status(200).json(result)
})

app.get('/student/get-my-assignments', async (req, res) => {
  const result = await new Promise((resolve, reject) => {
    db.query('SELECT a.*, p.Id AS Id, p.State, p.Assignment_id FROM assignments a JOIN participate p ON a.Id=p.Assignment_id WHERE p.Student_id=?;', [[req.user.studentId]], (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });

  res.status(200).json(result)
})

app.post('/student/assignment-apply/:participateId', async (req, res) => {
  await participate(req.params.participateId, req.user.studentId)
  return res.status(200).json();
})

app.post('/student/assignment-submit/:participateId', async (req, res) => {
  await updateAssignmentState(req.params.participateId, 'Pending')
  return res.status(200).json();
})

app.post('/professor/assignment-approve/:participateId', async (req, res) => {
  const participateId = req.params.participateId
  const assignment = await getAssignmentInfo(participateId);
  if(!assignment) return res.status(404).json()
  if( assignment.Professor_id != req.user.userId) return res.status(403).json()
  await updateStudentHours(assignment.Student_id, assignment.Hours)
  await updateAssignmentState(participateId, 'Approved')
  return res.status(200).json();
})

app.post('/professor/assignment-deny/:participateId', async (req, res) => {
  const participateId = req.params.participateId
  const assignment = await getAssignmentInfo(participateId);
  if(!assignment) return res.status(404).json()
  if( assignment.Professor_id != req.user.userId) return res.status(403).json()
  await updateAssignmentState(participateId, 'Denied')
  return res.status(200).json();
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

app.post('/student/create-assignment', async (req, res) => {
  const { name, hours, info, date } = req.body
  const assignment_id = await createAssignment(name, hours, info, date, req.user.userId)
  await participate(assignment_id, req.user.studentId)
  return res.redirect(`/student`);
})

app.post('/professor/create-assignment', async (req, res) => {
  const { name, hours, info, date } = req.body
  const assignment_id = await createAssignment(name, hours, info, date, req.user.userId)
  const classess = await getProfessorClasses(req.user.userId)
  await adjustVisibility(assignment_id, classess)
  return res.redirect(`/professor`);
})

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', '404.html'))
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

async function createAssignment(name, hours, info, date, userId, studentId){
  const assignment_id = uuidv4()
  const result = await new Promise((resolve, reject) => {
    db.query('INSERT INTO assignments (Id, Name, Hours, Info, Date, User_id) VALUES ?', [[[assignment_id, name, hours, info, date, userId]]], (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });

  return assignment_id
}

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
  const student = await new Promise((resolve, reject) => {
    db.query('SELECT * FROM students WHERE User_id=?', [[[req.user.userId]]], (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
  if(student.length == 0) return res.status(403).json({ error: 'Access forbidden!' });
  req.user.studentId = student[0].Id
  return next();
}

async function participate(assignment, student){
  const participate_id = uuidv4()
  const result = await new Promise((resolve, reject) => {
    db.query('INSERT INTO participate (Id, Assignment_id, Student_id) VALUES ?', [[[participate_id, assignment, student]]], (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });

  return result
}


async function adjustVisibility(assignment, classes){
  const visibilityArray = []

  classes.forEach(c => {
    visibilityArray.push([assignment, c.Id])
  })

  const result = await new Promise((resolve, reject) => {
    db.query('INSERT INTO visibility (Assignment_id, Class) VALUES ?', [visibilityArray], (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });

  return result
}

async function updateAssignmentState(assignmentId, state){
  const result = await new Promise((resolve, reject) => {
    db.query('UPDATE participate SET State=? WHERE Id=?;', [[state], [assignmentId]], (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });

  return result
}

async function getProfessorClasses(professor){
  const classes = await new Promise((resolve, reject) => {
    db.query('SELECT * FROM classes WHERE Professor_id = ?', [[[professor]]], (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });


  return classes
}

async function getAssignmentInfo(participateId){
  
  const assignment = await new Promise((resolve, reject) => {
    db.query('SELECT c.Professor_id, a.*, p.State, p.Id AS Participate_id, p.Student_id FROM students s JOIN participate p ON p.Student_id=s.Id JOIN classes c ON s.Class_id=c.Id JOIN assignments a ON p.Assignment_id = a.Id WHERE p.Id = ?', [[[participateId]]], (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  })

  if(assignment[0]) return assignment[0];

  return null
}


async function updateStudentHours(studentId, hours){
  const result = await new Promise((resolve, reject) => {
    db.query('UPDATE students SET Hours=Hours+? WHERE Id=?;', [[hours], [studentId]], (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });

  return result
}