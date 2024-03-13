const studentContainer = document.getElementById('student-container')


r = new Request("/professor/get-students")

fetch(r).then(re=>{re.json().then(data=>{
  for(student of data){
    studentContainer.append(createStudent(student))
  } 
})})


function createStudent(student){
  const studentDiv = document.createElement('div');
  studentDiv.classList.add('student-all');
  studentDiv.id = student.Id;
  
  const collapsibleDiv = document.createElement('div');
  collapsibleDiv.classList.add('student', 'collapsible');
  collapsibleDiv.textContent = student.Name;
  
  const contentDiv = document.createElement('div');
  contentDiv.classList.add('content');
  contentDiv.style.display = 'none';
  
  const info1Div = document.createElement('div');
  info1Div.classList.add('info1');
  contentDiv.textContent = 'Class: ' + student.Class + '   Hours: ' + student.Hours


  collapsibleDiv.addEventListener("click", function() {
    this.classList.toggle("active");
    if (contentDiv.style.display === "flex") {
      contentDiv.style.display = "none";
    } else {
      contentDiv.style.display = "flex";
    }
  });      

  
  contentDiv.appendChild(info1Div);
  collapsibleDiv.appendChild(contentDiv)
  studentDiv.appendChild(collapsibleDiv);
  
  return studentDiv
}

