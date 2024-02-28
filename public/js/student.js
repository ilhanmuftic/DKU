const assContainer = document.getElementById('all-assignments')
const brk = document.createElement('br')
var Assignments

var stringToHTML = function (str) {
	var parser = new DOMParser();
	var doc = parser.parseFromString(str, 'text/html');
	return doc.body.getElementsByTagName('*')[0];
};

r = new Request("/student/get-my-assignments")

fetch(r).then(re=>{re.json().then(data=>{console.log(data)})})

r = new Request("/student/get-assignments")

fetch(r).then(re=>{re.json().then(data=>{console.log(data)})})
