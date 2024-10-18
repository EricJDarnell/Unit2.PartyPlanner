/** Objects and variables */
const COHORT = `2408-FTB-MT-WEB-PT`;
const API_URL = `https://fsa-crud-2aa9294fe819.herokuapp.com/api/${COHORT}/events`;
const partyList = document.querySelector("#parties");
console.log(partyList); // remove
const form = document.querySelector("form");
const state = {
    events: [],
}
/**   Functions */
//fetch request to retrieve events
async function getEvents() {
    try {
      const response = await fetch(API_URL);
      const json = await response.json();
      state.events = json.data;
      console.log(state.events);//for confirmation
    } catch (error) {
      console.error(error);
    }
    renderEvents();
}
function renderEvents() {
    const eventCards = state.events.map(party => {
        const eventCard = document.createElement("li");
        const eventDateTime = new Date(party.date);
        const dateString = eventDateTime.toLocaleDateString();
        const timeString = eventDateTime.toLocaleTimeString();
        eventCard.innerHTML =`
          <h2>${party.name}
          <button id="${party.id}">x</button>
          </h2>
          <p>${dateString}</>
          <p>${timeString}</>
          <p>${party.location}</p>
          <p>${party.description}</p>
        `
        return eventCard
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
/** Event Listeners */
form.addEventListener("submit", (e) => {
    e.preventDefault();
    const eventName = form.eventName.value;
    const dateTime = new Date(form.eventDateTime.value);
    const location = form.eventLocation.value;
    const eventDescription = form.eventDescription.value;

    const eventObject = {
        name: eventName,
        description: eventDescription,
        date: dateTime,
        location:location,
    }; //layout was based on documentation provided
    addEvent(eventObject);
});
partyList.addEventListener("click", async (e) => {
    e.preventDefault();
    console.log(e.target.id);
    try {
        const response = await fetch(`${API_URL}/${e.target.id}`, {
            method: "DELETE",
        });
        const json = await response.json();

        if (json.error) {
            throw new Error(json.error.message);
        }
    } catch (error) {
        console.error(error);
    }
    getEvents();
})

/** execute the code */
getEvents();