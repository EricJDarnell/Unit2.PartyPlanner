/**-----------------Objects and variables-------------*/
const COHORT = `2408-FTB-MT-WEB-PT`;
const EVENT_URL = `https://fsa-crud-2aa9294fe819.herokuapp.com/api/${COHORT}/events`;
const GUEST_URL = `https://fsa-crud-2aa9294fe819.herokuapp.com/api/${COHORT}/guests`;
const RSVP_URL = `https://fsa-crud-2aa9294fe819.herokuapp.com/api/${COHORT}/rsvps`;

const partyList = document.querySelector("#parties");
const form = document.querySelector("#eventSubmission");
const guestLog = document.querySelector("#guestLog");

const state = {
  events: [],//{id:, name:, description:, date:, location:, …}
  guests: [],//{id:, name:, email:, phone:,}
  rsvps: [],//{id:, guestId:, eventId:,}
  currentGuest: { name: "Paul Sherer"},
};
 
function guestList(event) {
  //takes a state.events.id as a prompt
  //filter or reduce rsvp list to only matching event ids.
  const eventRsvpFilter = state.rsvps.filter((r) => r.eventId == event);
  console.log('eventRsvpFilter: ', eventRsvpFilter);
  //match the guests using their ids from state.guests
  const guestFilterArray = [];
    state.guests.forEach(g => { 
      eventRsvpFilter.forEach((r) => {
        r.guestId == g.id ? guestFilterArray.push(g) : null;
      })});
  console.log('guestFilterArray: ', guestFilterArray);
  //map a new array of guests using the array of filteredrsvps
  //send guestFilterArray off to be rendered into HTML
  renderGuests(guestFilterArray, event);
}

function renderGuests(gList, evId){
  //create a some html with the things
  const guestSection = document.querySelector(`#guest-list-${evId}`);
  const renderedList = gList.map((g) => {
    const individual = document.createElement("p");
    individual.innerText = g.name;
    return individual;
  });
  guestSection.replaceChildren(...renderedList);
}

/**--------------Functions-----------------------*/
//fetch request to retrieve events
async function getEvents() {
  try {
    const responseEvent = await fetch(EVENT_URL);
    const jsonEvent = await responseEvent.json();
    state.events = jsonEvent.data;
    console.log("state.events: ", state.events);

    const responseRsvp = await fetch(RSVP_URL);
    const jsonRsvp = await responseRsvp.json();
    state.rsvps = jsonRsvp.data;
    console.log("state.rsvps: ", state.rsvps);

    const responseGuest = await fetch(GUEST_URL);
    const jsonGuest = await responseGuest.json();
    state.guests = jsonGuest.data;
    console.log("state.guests: ", state.guests);
  } catch (error) {
    console.error(error);
  }
  renderEvents();
}

function renderEvents() {
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

  if (state.currentGuest.length !== 0) {
    //TODO add return function overwriting the form
    console.log("state.currentGuest: ", state.currentGuest);
    //replace form with Welcome <Guest Name>
    const welcomeMsg = document.createElement("h2");
    welcomeMsg.innerText = `Welcome ${state.currentGuest.name}!`;
    guestLog.replaceChildren(welcomeMsg);
  }
}

async function addEvent(event) {
  try {
    const response = await fetch(EVENT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // Authorization: "string of some type may be required"
      body: JSON.stringify(event),
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

async function addGuest(guest) {
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

async function deleteEvent(id) {
  try {
    const response = await fetch(`${EVENT_URL}/${id}`, {
      method: "DELETE",
    });
    console.log("delete response:", response);
    if (!response.ok) {
      throw new Error(error.message);
    }
    await response.json();
  } catch (error) {
    console.error(error);
  }
  getEvents();
}

async function deleteGuest(id) {
  try {
    const response = await fetch(`${GUEST_URL}/${id}`, {
      method: "DELETE",
    });
    console.log("delete response:", response);
    if (!response.ok) {
      throw new Error(error.message);
    }
    await response.json();
  } catch (error) {
    console.error(error);
  }
  getEvents();
}
// deleteGuest();

async function rsvpPost(request) {
  //TODO Fix this shit!!!
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

/**-------------Event Listeners----------------*/
partyList.addEventListener("click", (e) => {
  e.preventDefault();
  console.log("e.target: ", e.target);
  if (e.target.className === "delete") {
    const delId = e.target.id.split("-")[1]; //button id is ="delete-#id"
    console.log("delId: ", delId);
    // deleteEvent(delId);
    
  } else if (e.target.className === "rsvp") {
    console.log("e.target.id: ", e.target.id);
    const evtId = parseInt(e.target.id.split("-")[1]);
    console.log("eventId: ", evtId);
    console.log("e.target.className: ", e.target.className);
    const guestMatch = state.guests.find(
      (guest) => guest.name === state.currentGuest.name
    );
    //create object for post request
    const rsvpRequest = {
      guestId: guestMatch.id,
      eventId: evtId,
    };
    rsvpPost(rsvpRequest);
  } else if (e.target.className === "guestList"){
    const glId = e.target.id.split("-")[1];
    guestList(glId);
  }
});

form.addEventListener("submit", (e) => {
  //   e.preventDefault();
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

guestLog.addEventListener("submit", (e) => {
  e.preventDefault();
  const guestObject = {
    name: guestLog.guestName.value,
    email: guestLog.email.value,
    phone: guestLog.phone.value,
  };
  state.currentGuest = guestObject;
  //send update rerquest to add guest to api guest list
  addGuest(state.currentGuest);
});

/**-------------- execute the code-----------------------*/
getEvents();
