let addBtn = document.querySelector(".add-btn");
let removeBtn = document.querySelector(".remove-btn");
let modalCont = document.querySelector(".modal-cont");
let mainCont = document.querySelector(".main-cont");
let textareaCont = document.querySelector(".textarea-cont");
let colors = ["lightpink", "lightblue", "lightgreen", "black"]; //All priority colours stored
let modalPriorityColor = colors[colors.length - 1];         //Default priority colour - Black
let allPriorityColors = document.querySelectorAll(".priority-color"); //To Add border class to priority colour box
let toolBoxColors = document.querySelectorAll(".color");

//Lock - Unlock Classes
let lockClass = "fa-lock";
let unlockClass = "fa-lock-open";

let ticketsArr = []; // All tickets Array

//Retrive and display old tickets when last tab was closed
if (localStorage.getItem("jira_tickets")) {
    ticketsArr = JSON.parse(localStorage.getItem("jira_tickets"));
    ticketsArr.forEach((ticketObj) => {
        createTicket(ticketObj.ticketColor, ticketObj.ticketTask, ticketObj.ticketID);
    })
}

for(let i =0;i<toolBoxColors.length;i++){
    toolBoxColors[i].addEventListener("click", (e) => {
        let currentToolBoxColor = toolBoxColors[i].classList[0];

        let filteredTickets = ticketsArr.filter((ticketObj, idx) => {
            return currentToolBoxColor === ticketObj.ticketColor;
        })
        // Remove previous tickets
        let allTicketsCont = document.querySelectorAll(".ticket-cont");
        for(let i =0; i<allTicketsCont.length;i++)
        {
            allTicketsCont[i].remove();
        }
        // Display new filtered tickets
        filteredTickets.forEach((ticketObj, idx) => {
            createTicket(ticketObj.ticketColor, ticketObj.ticketTask, ticketObj.ticketID);
        })
    })

    toolBoxColors[i].addEventListener("dblclick", (e) => {
        let allTicketsCont = document.querySelectorAll(".ticket-cont");
        // Remove previous tickets
        for(let i =0; i<allTicketsCont.length;i++)
        {
            allTicketsCont[i].remove();
        }
        // Display all tickets object array
        ticketsArr.forEach((ticketObj, idx) => {
            createTicket(ticketObj.ticketColor, ticketObj.ticketTask, ticketObj.ticketID);
        })
    })
}
//Change priority color while creating modal functionality
allPriorityColors.forEach((colorElem) => {
    colorElem.addEventListener("click", (e) => {
        //Remove border class from color element 
        allPriorityColors.forEach((defaultColor) => {
            defaultColor.classList.remove("border");
        })
        //Add border class on clicked color Element
        colorElem.classList.add("border");
        // Get class name of the clicked color element
        modalPriorityColor = colorElem.classList[0];
    });
});

//Add & Remove button Functionality

let addFlag = false; 
let removeFlag = false;  
// IF addFlag -> true -> Modal Display:flex
// IF addFlag -> false -> Modal display:None

addBtn.addEventListener("click", (e) => {
    addFlag = !addFlag;
    if(addFlag)
    {
        modalCont.style.display = "flex";
    }
    else{
        modalCont.style.display = "none";
    }
})

removeBtn.addEventListener("click", (e) => {
    removeFlag = !removeFlag;
})

// Pressing shift Key to add a ticket
modalCont.addEventListener("keydown", (e) => {
    let key = e.key;
    if(key === "Shift")
    {
        createTicket(modalPriorityColor, textareaCont.value);
        addFlag = false;
        setModalToDefault();
    }
})

// Function to create a ticket
function createTicket(ticketColor, ticketTask, ticketID){
    let id = ticketID || shortid();
    let ticketCont = document.createElement("div");
    ticketCont.setAttribute("class", "ticket-cont")
    ticketCont.innerHTML = `
        <div class="ticket-color ${ticketColor}"></div>
        <div class="ticket-id">#${id}</div>
        <div class="task-area">${ticketTask}</div>
        <div class="ticket-lock">
                <i class="fa-solid fa-lock"></i>
            </div>
        `;

    // Does not exist so creating an object of ticket and pushing in the ticket array
    if (!ticketID) {
        ticketsArr.push({ ticketColor, ticketTask, ticketID: id });
        localStorage.setItem("jira_tickets", JSON.stringify(ticketsArr));
    }
    mainCont.appendChild(ticketCont); //Add created ticket to the main container
    handleRemoval(ticketCont, id);       // Handle Remove: attach remove click event listner on every created ticket
    handleLock(ticketCont, id);
    handleColor(ticketCont, id);
}

// Handle Remove Functionality
function handleRemoval(ticket, id){
    //removeFlag -> True -> Remove
    ticket.addEventListener("click", (e) => {
        if(removeFlag)
        {
            let ticketIdx = getTicketIdx(id);
            ticketsArr.splice(ticketIdx, 1);
            let strTicketArr = JSON.stringify(ticketsArr);
            localStorage.setItem("jira_tickets", strTicketArr);
            
            ticket.remove();
            removeFlag=false;
        }
    });
}

function handleLock(ticket, id){
    let ticketLockEle = ticket.querySelector(".ticket-lock");
    let ticketLock = ticketLockEle.children[0];
    let ticketTaskArea = ticket.querySelector(".task-area");
    let ticketIdx = getTicketIdx(id);
    
    ticketLock.addEventListener("click", (e) =>{
        if(ticketLock.classList.contains(lockClass))
        {
            ticketLock.classList.remove(lockClass);
            ticketLock.classList.add(unlockClass);
            ticketTaskArea.setAttribute("contenteditable", "true");
        }
        else
        {
            ticketLock.classList.remove(unlockClass);
            ticketLock.classList.add(lockClass);
            ticketTaskArea.setAttribute("contenteditable", "false");
        }

        //Modify data in Local storage (Ticket Task)
        ticketsArr[ticketIdx].ticketTask = ticketTaskArea.innerText;
        localStorage.setItem("jira_tickets", JSON.stringify(ticketsArr));
    })
}   

function handleColor(ticket, id){
    let ticketColor = ticket.querySelector(".ticket-color");
    ticketColor.addEventListener("click", (e) => {
        // Get ticket index from ticketsArr
        let ticketIdx = getTicketIdx(id);

        let currentTicketColor = ticketColor.classList[1];
        // Get ticket color idx
        let currentTicketColorIdx = colors.findIndex((color) => {
            return currentTicketColor === color;
        });
        currentTicketColorIdx++;
        let newTicketColorIdx = currentTicketColorIdx % colors.length;
        let newTicketColor = colors[newTicketColorIdx];
        ticketColor.classList.remove(currentTicketColor);
        ticketColor.classList.add(newTicketColor);

        // Modify data in Local Storage (Priority color chnaged)
        ticketsArr[ticketIdx].ticketColor = newTicketColor;
        localStorage.setItem("jira_tickets", JSON.stringify(ticketsArr));
    });
}

function getTicketIdx(id) {
    let ticketIdx = ticketsArr.findIndex((ticketObj) => {
        return ticketObj.ticketID === id;
    })
    return ticketIdx;
}

function setModalToDefault() {
    modalCont.style.display = "none";
    textareaCont.value = "";
    modalPriorityColor = colors[colors.length - 1];
    allPriorityColors.forEach((priorityColorElem, idx) => {
        priorityColorElem.classList.remove("border");
    })
    allPriorityColors[allPriorityColors.length - 1].classList.add("border");
}

