document.addEventListener('DOMContentLoaded', () => {
	// Initialize Firebase
	const config = {
	    apiKey: "AIzaSyCFpnyv7TrC86kln7fxiQUtm69E0ikoSM0",
	    authDomain: "week-7-firebase.firebaseapp.com",
	    databaseURL: "https://week-7-firebase.firebaseio.com",
	    storageBucket: "week-7-firebase.appspot.com",
	    messagingSenderId: "790135334324"
	};
	firebase.initializeApp(config);
	//database reference
	let database = firebase.database();

	//Alert DOM elements referenced
	let alert = document.querySelector('.alert');
	let alertMessage = document.querySelector('.alert p');

	//Regex to test that time input is in strict hh:mm format
	const hh_mm = new RegExp('^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$');

	const appendRow = (trainObject) => {
		let tr = document.createElement('tr');
		let th = document.createElement('th');
		let td; //Reused to create each cell
		
		Object.keys(trainObject).map((x, i) => {
			if (x == 'trainName') {
				th.scope = 'row';
				th.innerHTML = trainObject[x];
				tr.insertBefore(th, tr.firstChild);
			} else if (x == 'destination' || x == 'frequency') {
				td = document.createElement('td');
				td.innerHTML = trainObject[x];
				tr.appendChild(td);
			}
		});
		//Next Arrival Time
		let nextArrivalTime = calculateNextArrival(moment(trainObject.startTime, "HH:mm"), trainObject.frequency);
		td = document.createElement('td');
		td.innerHTML = nextArrivalTime;
		tr.appendChild(td);

		//Minutes Away
		td = document.createElement('td');
		let span = document.createElement('span');
		span.setAttribute('data-livestamp', moment(nextArrivalTime, 'HH:mm').format('X'))
		td.appendChild(span); //Span for livestamp.js
		tr.appendChild(td);
		//Append row to the body
		document.querySelector('tbody').appendChild(tr);
	}

	const calculateNextArrival = (startTime, frequency) => {
		let minutesDiff = moment().diff(moment(startTime), 'minutes');
		let minutesUntilNext = frequency - (minutesDiff  % frequency);
		return moment().add(minutesUntilNext, 'minutes').format('HH:mm');
	}

	const alertController = (success = true)  => {
		alert.classList.remove('alert-warning', 'alert-success');
		if (success) {
			alert.classList.add('alert-success');
			alertMessage.innerHTML = 'Your train has been added to the schedule. See the update above.';
		} else {
			alert.classList.add('alert-warning');
			alertMessage.innerHTML = 'Your input is not what we were expecting. Make sure your frequency is a whole number and your start time is in 24-hour time.';
		}
		alert.classList.remove('hidden');
	}

	const submitEvent = () => {
		let addTrainObject = {};
		addTrainObject.trainName = document.getElementById('trainName').value.trim();
		addTrainObject.destination = document.getElementById('destination').value.trim();
		addTrainObject.frequency = document.getElementById('frequency').value.trim();
		addTrainObject.startTime = document.getElementById('startTime').value.trim();
		addTrainObject.dateAdded = firebase.database.ServerValue.TIMESTAMP;
		//Test regex on input and ensure frequency is an integer
		if (hh_mm.test(addTrainObject.startTime) &&
		Number.isInteger(parseInt(addTrainObject.frequency))) {
			database.ref().push(addTrainObject);
			Array.from(document.querySelectorAll('input.form-control')).map((x) => x.value = "");
			alertController();			
		} else alertController(false);
		return false;
	}

	const clearEvent = () => {
		let inputs = Array.from(document.querySelectorAll('input'));
		inputs.map((x) => x.value = '');
		alert.classList.add('hidden');
		return false;
	}

	//Click listener for the add train form
	document.getElementById('submit').addEventListener('click', submitEvent);
	document.getElementById('clear').addEventListener('click', clearEvent);
	//Add relative timestamp to show when it was last updated
	let updatedTimestamp = document.getElementById('updatedTimestamp')
	updatedTimestamp.setAttribute('data-livestamp', moment().format('X'));

	//Append a new row for each of the snapshot children
	database.ref().orderByChild("dateAdded").on("child_added", (snapshot) => (
		appendRow(snapshot.val())
	));

}); //DOMContentLoaded