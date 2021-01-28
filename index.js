const cadence = document.querySelector('#cadence');
const duration = document.querySelector('#duration');
const distance = document.querySelector('#distance');
const type = document.querySelector('#type');
const form = document.querySelector('#form');
const elevation = document.querySelector('#elevation');
const formElevation = document.querySelector('.elevation-form');
const formCadence = document.querySelector('.cadence-form');
const formContainer = document.querySelector('.unique-box');
const mapDiv = document.querySelector('.map');

class Workout {
    todayDate = new Date();
    constructor(distance, duration) {
        this.distance = distance;
        this.duration = duration;
        this.setTime();
    }
    setTime(){
        const Months = ['January','February','March','April','May','June','July','August','September','October','Novemeber','Decemeber'];
        this.day = Months[this.todayDate.getMonth()] + ' ' + this.todayDate.getDate();
        return this.day;
    }
}
class Running extends Workout {
    typeValue = 'Running';
    pace;
    constructor(distance, duration, cadence,coords) {
        super(distance, duration)
        this.cadence = cadence;
        this.coords = coords;
        this.calcPace();
        this.setTime();
    }
    calcPace() {
        this.pace = ((this.duration) / (this.distance)).toFixed(1);
        return this.pace;
    }
}
class Cycling extends Workout {
    typeValue = 'Cycling';
    constructor(distance, duration, elevation,coords) {
        super(distance, duration)
        this.elevation = elevation;
        this.coords = coords;
        this.calcSpeed();
        this.setTime();
    }
    calcSpeed() {
        this.speed = ((this.distance) / (this.duration)).toFixed(1);
        return this.speed;
    }
}

class Map {
    mapDisplay;
    workoutObject = [];
    mapCurrentPosition;
    constructor() {
        this.renderMap();
        type.addEventListener('change', this.toggleElevation.bind(this));
        form.addEventListener('submit', this.createObject.bind(this));
        this.getLocalStorage();
    }
   
    renderMap() {
        navigator.geolocation.getCurrentPosition(position => {
            const {
                latitude,
                longitude
            } = position.coords;
            this.mapDisplay = L.map('maps').setView([latitude, longitude], 13);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(this.mapDisplay);
    
            this.workoutObject.forEach(element => this.createWorkOutOnPop(element));
            this.mapDisplay.on('click', this.showForm.bind(this));
        },function(){
            alert('Could not find position,kindly reload or check internet connection');
        })
    }
    toggleElevation(event) {
        event.preventDefault();
        formElevation.classList.toggle('hidden');
        formElevation.classList.toggle('grid');
        formCadence.classList.toggle('hidden');
        formCadence.classList.toggle('grid');
    }
    showForm(position) {
        this.mapCurrentPosition = position;
        formContainer.classList.remove('hidden');
        formContainer.classList.add('flex');
    }
    hideForm() {
        formContainer.classList.add('hidden');
        formContainer.classList.remove('flex');
    }
    createObject(event) {
        event.preventDefault();
        const distanceValue = Number(distance.value);
        const durationValue = Number(duration.value);
        const elevationValue = Number(elevation.value);
        const cadenceValue = Number(cadence.value);
        const { lat : _latitude, lng : _longitude } = this.mapCurrentPosition.latlng;
        const isInputANumber = (...inputs) => inputs.every(element => isNaN(element));
        const isInputNotPositive = (...inputs) => inputs.every(element => element < 0);
        const someIsNotPositive = (...inputs) => inputs.some(element => element < 0);
        const someIsInputANumber = (...inputs) => inputs.some(element => isNaN(element));
        let workout;
        if (type.value == 'running') {
            if (isInputANumber(distanceValue, durationValue, cadenceValue) || isInputNotPositive(distanceValue, durationValue, cadenceValue) || someIsNotPositive(distanceValue, durationValue, cadenceValue) || someIsInputANumber(distanceValue, durationValue, cadenceValue)) {
                alert('inputs have to be positive');
            } else {
                workout = new Running(distanceValue, durationValue, cadenceValue,[_latitude,_longitude]);
                console.log(workout);
            }
            distance.value = duration.value = cadence.value = '';
        }
        if (type.value == 'cycling') {
            if (isInputANumber(distanceValue, durationValue, elevationValue) || isInputNotPositive(distanceValue, durationValue, elevationValue) || someIsNotPositive(distanceValue, durationValue, elevationValue) || someIsInputANumber(distanceValue, durationValue, elevationValue)) {
                alert('inputs have to be positive');
            } else {
                workout = new Cycling(distanceValue, durationValue, elevationValue,[_latitude,_longitude]);
                console.log(workout);
            }
            distance.value = duration.value = elevation.value = '';
        }
        this.workoutObject.push(workout);
        this.renderWorkoutBox(workout);
        this.createWorkOutOnPop(workout);
        this.hideForm();
        this.setLocalStorage();
    }

    renderWorkoutBox(workout) {
        const html = `
        <div class="big-workout-container unique-box ${workout.typeValue == "Running" ? 'workout-Running-border-style' : 'workout-Cycling-border-style'}">
        <div class="workout-container">
            <p class="result-title">${workout.typeValue} on ${workout.day} </p>
            <div class="result-container">
                <p class="result"> ${workout.typeValue == "Running" ? ' 🏃' : '🚴‍♀️'} <span class="distance-result result-text">${workout.distance}</span><span
                        class="distance-unit unit">km</span></p>
                <p class="result">⏱ <span class="duration-result result-text">${workout.duration}</span><span
                        class="duration-unit unit">min</span></p>
                <p class="result">⚡<span class="speed-result result-text">${workout.typeValue == "Running" ? workout.pace : workout.speed}</span> <span
                        class="speed-unit unit">min/km</span></p>
                <p class="result special-effect">${workout.typeValue == "Running" ? '◻◻'  : '🗻'}<span class="cadence-result result-text">${workout.typeValue == "Running" ? workout.cadence : workout.elevation}</span><span
                        class="cadence-unit unit">spm</span></p>
            </div>
        </div>
        </div>`

        document.querySelector('.section-sidebar').insertAdjacentHTML('beforeend', html);
    }
    createWorkOutOnPop(workout){
        L.marker(workout.coords).addTo(this.mapDisplay)
        .bindPopup(
            L.popup({
                maxWidth: 250,
                minWidth: 100,
                autoClose: false,
                closeOnClick: false,
                className : `workout-${workout.typeValue}-border-style`,
            })
        )
    .setPopupContent(`${workout.typeValue} on  ${workout.day} `)
    .openPopup();
    }
    setLocalStorage(){
            localStorage.setItem('localStorageWorkOut',JSON.stringify(this.workoutObject))
    }
    getLocalStorage(){
        const localStorageData = JSON.parse(localStorage.getItem('localStorageWorkOut'));
        if (!localStorageData) return;
        this.workoutObject = localStorageData;
        this.workoutObject.forEach(element => this.renderWorkoutBox(element))
    }
}
const mapInstance = new Map();