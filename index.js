/**-----------------Objects and variables-------------*/
const COHORT = `2408-FTB-MT-WEB-PT`;
const API_URL = `https://fsa-crud-2aa9294fe819.herokuapp.com/api/${COHORT}/events`;
const GUEST_URL = `https://fsa-crud-2aa9294fe819.herokuapp.com/api/${COHORT}/guests`;
const RSVP_URL = `https://fsa-crud-2aa9294fe819.herokuapp.com/api/${COHORT}/rsvps`;

const partyList = document.querySelector("#parties");
console.log(partyList); // remove
const form = document.querySelector("form");
const rsvpForm = document.querySelector(".rsvp");

const state = {
  events: [],
  guests: [],
  rsvps: [],
};

/**--------------Functions-----------------------*/
//fetch request to retrieve events
async function getEvents() {
  try {
    const responseEvent = await fetch(API_URL);
    console.log("GET response: ", responseEvent);
    const jsonEvent = await responseEvent.json();
    state.events = jsonEvent.data;
    console.log(state.events); //for confirmation

    const responseRsvp = await fetch(RSVP_URL);
    const jsonRsvp = await responseRsvp.json();
    state.rsvps = jsonRsvp.data;
    console.log(state.rsvps); //for confirmation

    const responseGuest = await fetch(GUEST_URL);
    const jsonGuest = await responseGuest.json();
    state.guests = jsonGuest.data;
    console.log(state.guests); //for confirmation
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
          <h2>${party.name}
          </h2>
          <button id="delete-${party.id}" class="delete">x</button>
          <p>${dateString}</>
          <p>${timeString}</>
          <p>${party.location}</p>
          <p>${party.description}</p>
          <h3>R.S.V.P.</h3>
          <form class="rsvp" id="rsvpId-${party.id}">
          <input type="text" id="guestName" placeholder="name">
          <input type="text" id="email" placeholder="guest@email.com">
          <input type="text" id"phone" placeholder="123-456-7890">
          <button type="submit" class="submitRsvp">Submit</button>
          </form>
        `;
    return eventCard;
  });

  partyList.replaceChildren(...eventCards);
}

async function addEvent(event) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // Authorization: "string of some type may be required"
      body: JSON.stringify(event),
    });
    const json = await response.json();

    if (json.error) {
      throw new Error(json.error.message);
    }
  } catch (error) {
    console.error(error);
  }
  getEvents();
}

async function deleteEvent(id) {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
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

/**-------------Event Listeners----------------*/
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

partyList.addEventListener("submit", (e) => {
    e.preventDefault();
    if (e.target.className === "rsvp") {
        console.log("submitRsvp: hit!");
        const guestObject = {
          name: e.target.guestName.value,
          email: e.target.email.value,
          phone: e.target.email.phone,
        };
        console.log("guestObject: ", guestObject);
}
});

partyList.addEventListener("click", (e) => {
  e.preventDefault();
  if (e.target.className === "delete") {
    const delId = e.target.id.split("-")[1]; //button id is ="delete-#id"
    console.log("delId: ", delId);
    deleteEvent(delId);
  } 
  
  console.log("e.target: ", e.target);
  console.log('e.target: ', e.target.value);
});


/**-------------- execute the code-----------------------*/
getEvents();
