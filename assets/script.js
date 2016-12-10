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
	let database = firebase.database();

	database.ref().orderByChild("dateAdded").on("child_added", (snapshot) => {
		appendRow(snapshot.val());
	});

	const hh_mm = new RegExp('^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$');

	const appendRow = (trainObject) => {
		let tr = document.createElement('tr');
		let th = document.createElement('th');
		let td;
		
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
		td = document.createElement('td');
		td.innerHTML = calculateTime(trainObject.startTime, trainObject.frequency)
		tr.appendChild(td);

		//Minutes Away
		td = document.createElement('td');
		td.innerHTML = moment().endOf('day').fromNow(); //calculateTime(trainObject.startTime, trainObject.frequency);
		tr.appendChild(td);
		document.querySelector('tbody').appendChild(tr);

	}

	const calculateTime = (startTime, frequency) => {
		return (moment().diff(startTime)) % frequency;

	}

	const submitEvent = () => {
		const addTrainObject = {};
		addTrainObject.trainName = document.getElementById('trainName').value.trim();
		addTrainObject.destination = document.getElementById('destination').value.trim();
		addTrainObject.frequency = document.getElementById('frequency').value.trim();
		addTrainObject.startTime = document.getElementById('startTime').value.trim();
		addTrainObject.dateAdded = firebase.database.ServerValue.TIMESTAMP;
		if (hh_mm.test(addTrainObject.startTime) &&
			Number.isInteger(parseInt(addTrainObject.frequency))) { database.ref().push(addTrainObject)
		} else console.log('No match')

		return false;
	}

	const clearEvent = () => {
		let inputs = Array.from(document.querySelectorAll('input'));
		inputs.map((x) => console.log(x.value = ''));
		return false;
	}

	document.getElementById('submit').addEventListener('click', submitEvent);
	document.getElementById('clear').addEventListener('click', clearEvent);

});