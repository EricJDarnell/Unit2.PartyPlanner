/**-----------------Objects and variables-------------*/
const COHORT = `2408-FTB-MT-WEB-PT`;
const EVENT_URL = `https://fsa-crud-2aa9294fe819.herokuapp.com/api/${COHORT}/events`;
const GUEST_URL = `https://fsa-crud-2aa9294fe819.herokuapp.com/api/${COHORT}/guests`;
const RSVP_URL = `https://fsa-crud-2aa9294fe819.herokuapp.com/api/${COHORT}/rsvps`;

const partyList = document.querySelector("#parties");
const form = document.querySelector("#eventSubmission");
const guestLog = document.querySelector("#guestLog");

const state = {
  events: [],//{id:, name:, description:, date:, location:,}
  guests: [],//{id:, name:, email:, phone:,}
  rsvps: [],//{id:, guestId:, eventId:,}
  currentGuest: [],
};
 
/**--------------Functions-----------------------*/
//functions that communicate with API--------------------------------------
async function getEvents() { //sends requests to API for events, guests, and rsvps then updates state object
  try {
    const responseEvent = await fetch(EVENT_URL);
    const jsonEvent = await responseEvent.json();
    state.events = jsonEvent.data;

    const responseRsvp = await fetch(RSVP_URL);
    const jsonRsvp = await responseRsvp.json();
    state.rsvps = jsonRsvp.data;
    
    const responseGuest = await fetch(GUEST_URL);
    const jsonGuest = await responseGuest.json();
    state.guests = jsonGuest.data;
  } catch (error) {
    console.error(error);
  }
  renderEvents();
}
async function addEvent(event) { //sends POST request to event API
  try {
    const response = await fetch(EVENT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // Authorization: "string of some type may be required"
      body: JSON.stringify(event),
    });
    const json = await response.json();
    console.log('json: ', json);

    if (!response.ok) {
      throw new Error(json.error.message);
    }
  } catch (error) {
    console.error(error);
  }
  getEvents();
}
async function addGuest(guest) { //sends POST request to guest API
  try {
    const response = await fetch(GUEST_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // Authorization: "string of some type may be required"
      body: JSON.stringify(guest),
    });
    const json = await response.json();

    if (!response.ok) {
      throw new Error(json.error.message);
    }
  } catch (error) {
    console.error(error);
  }
  getEvents();
}
async function deleteEvent(id) { //sends delete request to event API
  try {
    const response = await fetch(`${EVENT_URL}/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error(error.message);
    }
    await response.json();
  } catch (error) {
    console.error(error);
  }
  getEvents();
}
async function rsvpPost(request) { //sends post request to rsvp API
  try {
    const response = await fetch(RSVP_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // Authorization: "string of some type may be required"
      body: JSON.stringify(request),
    });
    const json = await response.json();

    if (!response.ok) {
      throw new Error(json.error.message);
    }
  } catch (error) {
    console.error(error);
  }
  getEvents();
}
async function deleteGuest(id) { //will send delete request to guest API
  try {
    const response = await fetch(`${GUEST_URL}/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error(error.message);
    }
    await response.json();
  } catch (error) {
    console.error(error);
  }
  getEvents();
}

//functions that create intermediate objects--------------------
function rsvpObject(e){ //creates an rsvp object using specific event id
  const guestMatch = state.guests.find(
    (guest) => guest.name === state.currentGuest.name
  );
  const rsvpRequest = { //create object for post request
    guestId: guestMatch.id,
    eventId: e,
  };
  rsvpPost(rsvpRequest);
}
function guestList(event) { //creates a guest list for the event specified
  //takes a state.events.id as a prompt
  //filter or reduce rsvp list to only matching event ids.
  const eventRsvpFilter = state.rsvps.filter((r) => r.eventId == event);
  //create a new array of guests using the array of eventRsvpFilter
  const guestFilterArray = [];
  //match the guests using their ids from state.guests
    state.guests.forEach(g => { 
      eventRsvpFilter.forEach((r) => {
        r.guestId == g.id ? guestFilterArray.push(g) : null;
      })});
  //send guestFilterArray off to be rendered into HTML
  renderGuests(guestFilterArray, event);
}

//functions that update HTML---------------------------
function renderEvents() { //updates html with list of events from using state object
  const eventCards = state.events.map((party) => {
    const eventCard = document.createElement("li");
    const eventDateTime = new Date(party.date);
    const dateString = eventDateTime.toLocaleDateString();
    const timeString = eventDateTime.toLocaleTimeString();
    eventCard.innerHTML = `
          <h2>${party.name}</h2>
          <p>${dateString}</>
          <p>${timeString}</>
          <p>${party.location}</p>
          <p>${party.description}</p>
          <button class="rsvp" id="rsvpId-${party.id}">RSVP</button>
          <button id="delete-${party.id}" class="delete">x</button>
          <section id="guest-list-${party.id}">
          <button class="guestList" id="guestList-${party.id}">Guest List</button>
          </section>
        `;
    return eventCard;
  });
  partyList.replaceChildren(...eventCards);

  if (state.currentGuest.length !== 0) { //checks if guest is currently "logged in"
    //replace children of form element with Welcome <Guest Name>
    const welcomeMsg = document.createElement("h2");
    welcomeMsg.innerText = `Welcome ${state.currentGuest.name}!`;
    guestLog.replaceChildren(welcomeMsg);
  }
}
function renderGuests(gList, evId){ //will populate a guest list and overwrite guest list button
  const guestSection = document.querySelector(`#guest-list-${evId}`);
  const renderedList = gList.map((g) => {
    const individual = document.createElement("p");
    individual.innerHTML = `${g.name}`
    // <button id="delGuest-${g.id}" class="del-guest">x</button> //if I want to restore guest delete functionality
    ;
    return individual;
  });
  guestSection.replaceChildren(...renderedList);
}

/**-------------Event Listeners----------------*/
partyList.addEventListener("click", (e) => { //functionality for buttons on party cards
  e.preventDefault();
  if (e.target.className === "delete") { //delete buttons
    const delId = e.target.id.split("-")[1]; //button id is ="delete-#id"
    deleteEvent(delId);

  } else if (e.target.className === "rsvp") { //rsvp buttons
    const evtId = parseInt(e.target.id.split("-")[1]);
    rsvpObject(evtId);

  } else if (e.target.className === "guestList"){ //reveals guest list
    const eveId = e.target.id.split("-")[1];
    guestList(eveId);

  } else if (e.target.className === "del-guest"){ //deletes guest by id
    const gId = e.target.id.split("-")[1];
    deleteGuest(gId);
  }
});

form.addEventListener("submit", (e) => { //creates event object
    e.preventDefault();
  const eventName = form.eventName.value;
  const dateTime = new Date(form.eventDateTime.value);
  const location = form.eventLocation.value;
  const eventDescription = form.eventDescription.value;

  const eventObject = {
    name: eventName,
    description: eventDescription,
    date: dateTime,
    location: location,
  }; //layout was based on documentation provided
  addEvent(eventObject);
});

guestLog.addEventListener("submit", (e) => { //creates guest object
  e.preventDefault();
  const guestObject = {
    name: guestLog.guestName.value,
    email: guestLog.email.value,
    phone: guestLog.phone.value,
  };
  state.currentGuest = guestObject;
  //send update request to add guest to api guest list
  addGuest(state.currentGuest);
});

/**-------------- execute the code-----------------------*/
getEvents();
