// Useful variables
// Its an id counter which serves a very useful purpose by guaranteing 100% unique ID
let idCounter = 1;
// Check if the letter is first in input and if its needed to print all elems starts with it letter
let needPrint = true;
let children = [];
// Getting an element to add a resultsContainer inside further and to restore and remove children (SEARCH)
let searchResultsContainerParent = document.getElementById("searchResults_w");

// Event listeners
document.getElementById("add").addEventListener("click", validateContact);
document.getElementById("abc").addEventListener("click", showContacts);
document.querySelector("body").addEventListener("click", removeContactNavigator);
document.getElementById("openSearch").addEventListener("click", openSearchBubble);
document.getElementById("closeBubble").addEventListener("click", closeSearchBubble);
document.getElementById("search").addEventListener("keyup", searchAndPrintContacts);

// An object, which contains all contacts depends on first letter of name
let contactsDB = {
	"a": [],
	"b": [],
	"c": [],
	"d": [],
	"e": [],
	"f": [],
	"g": [],
	"h": [],
	"i": [],
	"j": [],
	"k": [],
	"l": [],
	"m": [],
	"n": [],
	"o": [],
	"p": [],
	"q": [],
	"r": [],
	"s": [],
	"t": [],
	"u": [],
	"v": [],
	"w": [],
	"x": [],
	"y": [],
	"z": [],
	getCounter: function(firstLetter) {
		return this[firstLetter][0].get("counter"); // return counter by first letter
	}
}

// Validates data that comes from form by attempting to add a new contact
function validateContact() {
	/*
		Main points, that validation has to satisfy
		-) name {
			Required, not shorter than 3 symbols and no longer than 48 symbols
			First letter has to contain in our DB otherwise, we print an error message
			Cutting all spaces and convert html tags into enteties 
		}
		-) surname {
			Not required, not shorter than 3 symbols and no longer than 48 symbols
			Cutting all spaces and convert html tags into enteties 
		}
		-) phoneNumber {
			Required
			Cutting all spaces and convert html tags into enteties
			Has to satisfy some standart and be unique in its first letter haystack
			Getting a reg exp from here - https://stackoverflow.com/questions/2113908/what-regular-expression-will-match-valid-international-phone-numbers
		}
	*/

	// getting htmlDOMElems of fields
	// F - field; n - name; s - surname; p - phoneNumber
	let nameF = document.querySelector("input[name='name']");
	let surnameF = document.querySelector("input[name='surname']");
	let phoneNumberF = document.querySelector("input[name='number']");

	// name validation 
	let name = escapeHtml(nameF.value.replace(/\s/g, ''));
	let nVal = validateLen(name, 3, 48);
	//Validating
	if (nVal !== true) getErrorInput(nameF, nVal);
	else if (!name.match(/^[a-z]/)) {
		nVal = "First letter must be latin";
		getErrorInput(nameF, nVal);
	}
	else getSuccessInput(nameF, "Name*");

	// surname validation
	let surname = escapeHtml(surnameF.value.replace(/\s/g, ''));
	let sVal = true;
	//Validating
	if (surname.length) sVal = validateLen(surname, 3, 48);
	else surname = '';
	if (sVal !== true) getErrorInput(surnameF, sVal);
	else getSuccessInput(surnameF, "Surname");

	// phoneNumber validation
	let pVal = true;
	let phoneNumber = escapeHtml(phoneNumberF.value.replace(/\s/g, ''));
	let firstLetter = name.substr(0, 1).toLowerCase();
	//Validating
	if (!phoneNumber.match(/\+(9[976]\d|8[987530]\d|6[987]\d|5[90]\d|42\d|3[875]\d|2[98654321]\d|9[8543210]|8[6421]|6[6543210]|5[87654321]|4[987654310]|3[9643210]|2[70]|7|1)\d{1,14}$/)) {
		pVal = "Number is invalid: +xxxxx...";
		getErrorInput(phoneNumberF, pVal);
	}
	// Checking IF (name is not empty) AND (that DB by letter has been found)
	else if (name && contactsDB[firstLetter]) {
		// checking that contact is unique
		for (let i = 0; i < contactsDB[firstLetter].length; i++) {
			if (contactsDB[firstLetter][i].get("phoneNumber") === phoneNumber) {
				pVal = "Number must be unique";
				getErrorInput(phoneNumberF, pVal);
			}
		}
	}
	// IF all right with number
	if (pVal === true) getSuccessInput(phoneNumberF, "Number: +xxxxx...*");

	// If all VALs are ok and contains TRUE(not a string or smth else), so we add a new contact
	if (nVal === true && sVal === true && pVal === true) {
		addContact(name, phoneNumber, surname);
		nameF.value = surnameF.value = phoneNumberF.value = "";
	}
}

/* A function which works after form validation and add data to contactsDB and 
make an element with letter clickable if its needed */
function addContact(name, phoneNumber, $surname = "") {
	let firstLetter = name.substr(0, 1).toLowerCase(); // taking first letter NAME
	let disabled = document.querySelectorAll(".disabled"); // taking all disaled elems

	// Making an id varriable to independently work with current id further
	let contactId = idCounter;
	// Adding a new Map into array with contacts data
	contactsDB[firstLetter].push(new Map([["id", contactId], ["name", name], ["surname", $surname], ["phoneNumber", phoneNumber]]));
	idCounter++; // iterating idCounter to make a unique id to next contact

	let find = false; // if the disabled elem with first letter was found?

	// A forEach loop with a purpose to find a disabled elem with letter on which current name starts and enable it
	// A condition to check if there are any use in loop
	if (disabled.length > 0) {
		disabled.forEach(function(value) {
			// I am taking an id here supposing that every cat has its own id with lower letter which beggins name
			if (value.id === firstLetter) {
				value.className = 'letter'; // making elem enabled
				contactsDB[firstLetter].unshift(new Map([["counter", 0]])); // creating counter 
				find = true;
			}
		});
	}

	let counter = contactsDB.getCounter(firstLetter) // getting counter of current letter category;

	/* This is a special condition which checks if the element is opend now, and if so,
	it adds a new contact there that user can to see it without closing and again open the category */
	if (!find && (counter % 2 !== 0)) {
		let enabled = document.querySelectorAll(".letter"); // find all enabled elems
		enabled.forEach(function(value) {
			if (value.id === firstLetter) {
				// if match with id exists, so we add new elem into cat HTML
				let contact = returnContact(contactId, name, $surname, phoneNumber);
				value.lastElementChild.innerHTML += contact;
			}
		});
	}
}

// A function that shows all contacts starting with particular letter and closing them eithier
function showContacts(event) {
	// some variables which will use freqently, just to shortcode
	let obj = event.target;
	let classList = obj.classList;
	let parentObj = obj.parentNode;

	// Define if the right elem was clicked
	if (classList.contains("letterName") && !parentObj.classList.contains("disabled")) {
		let firstLetter = parentObj.id;
		let counter = contactsDB.getCounter(firstLetter);

		// if counter is event so, the category is closed, else - opened
		if (counter % 2 === 0) {
			let data = contactsDB[firstLetter];
			let contacts = document.createElement("div"); // creating a parent elem for contacts
			contacts.className = "contacts"; // giving a class name to it

			data.forEach(function(value) {
				// making a variable which contains a contact and adding its html into general block
				if (value.get('counter') === undefined) {
					let contact = returnContact(value.get("id"), value.get("name"), value.get("surname"), value.get("phoneNumber"));
					contacts.innerHTML += contact;
				}
			});
			// adding contacts into category
			parentObj.appendChild(contacts);
		}
		else {
			/* finding contacts block with forEach loop and removing them
			!!!! I haven't used .nextElementSibling because a future script owner may want to
			change order of HTML elements, so that property wont work correct, while loop will accomplish
			that work well */
			for (let i = 0; i < parentObj.children.length; i++) {
				if (parentObj.children[i].classList.contains('contacts')) {
					parentObj.removeChild(parentObj.children[i]);
					break;
				}
			}
		}
		// Itterating the counter which means that the state has been changed
		contactsDB[firstLetter][0].set("counter", ++counter);
	}
}

// Here I decide what type of remove do I need and do some other opperations after remove if its needed
function removeContactNavigator(event) {
	let obj = event.target; // getting obj

	// IF user want to remove smth being in list(starter page)
	if (obj.classList.contains('deleteList')) {
		commonRemove(obj, "contact", "insideId", "contacts");
	}
	// IF user want to remove smth being in search(Bubble)
	else if (obj.classList.contains('deleteSearch')) {
		commonRemove(obj, "sRes", "searchId", false);
		// If I removed contact from search, so I have to remove it from list(if its opened currently)
		removeVisuallyFromSomewhereByIdsAttr(obj, "sRes", "searchId", "insideId");
		// IF user has removed an item, and there no contacts that satisfy his search request, so I print a notFound message
		let isClear = countOrCheckVisibleElems(".sRes");
		if (isClear) notFoundMessage(true);
	}
}

// Removing contact - General Func
function commonRemove(obj, itsClass, idAttrName, superClassName) {
	/*
		itsClass - its a Class which contains a block which contains a contact
		idAttrName - it my own name of Id attribute for ex.: searchId, insideId, somethingId
		superClassName - its class name of block which contains all contacts for ex: searchResults
		superClassName - can BE FALSE, that means that it doesnt have to be removed
	*/
	// Getting delete Btn parrent node
	let contact = obj.parentNode;
	/*
		I use cycle because the number of parents can changing, it makes code more flexible
	*/
	while (!contact.classList.contains(itsClass)) {
		contact = contact.parentNode; // if classList doesnt contain itsClass(special for every type) so I get a parentNode
	}
	let contactsBlc = contact.parentNode; // get a parent of  contact
	// getting a firstLetter of name to match with ContactsDB then and getting unique Id to delete contact from haystack
	let firstLetter = contact.getAttribute("name").substr(0, 1).toLowerCase();
	let id = contact.getAttribute(idAttrName);

	// Deleting by using cycle and matching is contact contains its unique Id, than break to save time
	for (let i = 0; i < contactsDB[firstLetter].length; i++) {
		if (contactsDB[firstLetter][i].get('id') === +id) {
			contactsDB[firstLetter].splice(i, 1);
			break;
		}
	}
	// Visually removing from DOM
	contactsBlc.removeChild(contact);
	checkEmpty(firstLetter, contactsBlc, superClassName);
}

// Opens a bubble (make it visible by adding a css property display: flex;)
function openSearchBubble() {
	document.getElementById('searchBubble').style.display = 'flex';
}

// Closes a bubble (make it invisible by adding a css property display: none;)
// And empty it
function closeSearchBubble() {
	document.getElementById('searchBubble').style.display = 'none';
	// Empty input value
	document.getElementById("search").value = "";
	// Empty and restore search container
	removeAllResults();
}

// A function which is responsible for searching and printing elems
function searchAndPrintContacts(event) {
	let obj = event.target; // current object
	let searchVal = obj.value.toLowerCase(); // input value, which typed
	let firstLetter = searchVal.substr(0, 1); // getting the first letter of value to find data in contactsDB
	let contacts = contactsDB[firstLetter]; // taking Data by firstLetter
	let isContactsExists = (contacts && contacts.length); // match with db and that db not clear

	// IF value is not empty AND it was typed FIRST LETTER
	if (searchVal && needPrint) {
		// Creating a container which will contain all results 
		// + It's contains a message that shows user that nothing found(its invisible)
		// The Class SearchResults here is very important as well as id, it uses in removeContactNavigator function
		let searchResultsContainer = `
		<div class='searchResults' id='searchResults'>
		<h1 id='searchNotFound' class='starterBubble'>Unfortunatelly, nothing found :(</h1>
		</div>`;

		needPrint = false; // Saying that the first letter typed
		// Removing all children before adding a resultSearchContainer
		removeAllChildren(searchResultsContainerParent);
		// pasting resultsContainer into HTML of its parent elem
		searchResultsContainerParent.innerHTML += searchResultsContainer;
		// IF I have a match with DB by first Letter AND db isnt clear
		if (isContactsExists) {
			// Run a function to print all elems started with firstLetter
			printAllFirstLetterElemsFromArray(contacts);
		}
		else {
			// If I have no match with DB, so I cant find anything, so I make notFound elem visible
			notFoundMessage(true);
		}
	}
	// IF contacts exists, than I filter results which dont starts with input value
	else if (contacts) {
		// This variable will check if something was found
		let isFound = false;
		contacts.forEach(function(val) {
			// IF element contains name, so its defenetly a contact (not a 'count' for instance)
			if (val.get('name')) {
				// creating a string from Name and surname, so it would be easier to match with value
				let nameSurname = val.get('name') + " " + val.get('surname');
				nameSurname = nameSurname.toLowerCase(); // Turn it into lower case because of similar purpose
				// !!! IMPORTANT
				// Taking the element with a particular searchId(my own attribute), which ofcs is unique
				let elem = document.querySelector("div[searchId='"+ val.get('id') +"']");

				// Mathcing, if nameSurname starts with typed value
				// If so, I make it visible
				if (nameSurname.startsWith(searchVal)) {
					elem.style.display = 'flex';
					isFound = true; // If something founded, so I say that I dont have to print message that nothing found
				}
				// Else - invivsible
				else elem.style.display = 'none';
			}
		});
		// If nothing found, I make visible a message
		if (!isFound) notFoundMessage(true);
		// If smth found but this message is visible due to previous operations
		else notFoundMessage(false);
 	}
	// IF contacts dont exist AND input value is empty AND 
	// (!IMPORTANT) we don't have to print anything(otherwise it will work with shift, and other btns which will make an error)
	else if (!searchVal && !needPrint) {
		removeAllResults();
	}
	// IF none of these conditions are satisfied, so I dont change anything (Will be printed not found meassage)
}

// Helpers
// A function that build and return a contact based on 3 variables
function returnContact(id, name, surname, phoneNumber) {
	return `<div name='${name}' insideId='${id}' class='contact'>
		<div class='square'></div>
		<div><span class='nameSurname'>${name} ${surname}</span>
		<br /><span class='number'>${phoneNumber}</span>
		</div>
		<div class='delete deleteList'>X</div>
	</div>`;
}

/*
	A function which checks if the cat is empty and if so, it makes it disabled
	Also, it removes .contacts block to prevent its duplication
*/
function checkEmpty(firstLetter, contactsBlc, superClassName) {
	let haystackLen = contactsDB[firstLetter].length;
	if (haystackLen <= 1) {
		contactsDB[firstLetter] = [];
		document.getElementById(firstLetter).className = 'disabled';

		// It may doesnt have to remove a parent elem (if superClassName is false)
		if (superClassName) {
			while (!contactsBlc.classList.contains(superClassName)) {
				contactsBlc = contactsBlc.parentNode; // if classList doesnt contain superClass so I get a parentNode
			}
			// removing parent
			contactsBlc.parentNode.removeChild(contactsBlc);
		}
	}
}

// Function, that visually remove an HTML element based on own Ids attributes
function removeVisuallyFromSomewhereByIdsAttr(obj, parentClass, currentIdName, removerIdName) {
	/*
		obj - delete btn
		parentClass - contact wrapper class, from which I have to remove contact
		currentIdName - name of attribute, which contains Id of current contact (which was already deleted)
		removerIdName - name of attribute, which contains Id of object that I have to remove
		!!!EXAMPLE!!!
		REMOVING FROM CONTACT LIST
		I NEED
		1) searchID, bcs it equals to insideId
		2) Remove contact from parent class contacts
	*/
	// Getting parent of delete btn
	let contact = obj.parentNode;
	// Geting its other parent(if its needed)
	while (!contact.classList.contains(parentClass)) {
		contact = contact.parentNode;
	}
	// Getting an ID contact
	let currentId = contact.getAttribute(currentIdName);
	// Getting an contact which I've to remove by Id(its common because contact is in DB)
	let remover = document.querySelector("["+ removerIdName +"='"+ currentId +"']");

	// IF elem, that I've to remove was found, so remove it
	if (remover) remover.parentNode.removeChild(remover);
}

// Generating a random Number
function randNum(min, max) {
  min = parseInt(min);
  max = parseInt(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Validate string by min and if needed max length
function validateLen(str, $min = 3, $max = false) {
	if (str.length < $min) return `Not shorter ${$min} symbols`;
	if ($max && str.length > $max) return `Not longer ${$max} symbols`;
	return true;
}

// Put a special placeholder and add some styles to say that user typed incorrect data into input
function getErrorInput(elem, placeholder) {
	elem.setAttribute('placeholder', placeholder);
	elem.value = '';
	elem.style.border = "2px solid #f00";
	elem.style.background = "#fcaf50";
}

// Normalize the input to say thats all okay
function getSuccessInput(elem, placeholder) {
	elem.setAttribute('placeholder', placeholder);
	elem.style.border = "1px dashed #ff052b";
	elem.style.background = "#faafc4";
}

// Turn HTML code into enteties to make visual part correct
function escapeHtml(text) {
  var map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

// A function that makes element empty(removes all children)
function removeAllChildren(parent) {
	let c = Array.from(parent.children); // getting children of parent elem and turn it from HTMLCollection into Array
	// Simple loop that removes child with each iteration and\
	// (!!!IMPORTANT) saves its !!HTML!! into array
	for (let i = 0; i < c.length; i++) {
		parent.removeChild(c[i]);
		// saving children to restore them later
		children.push(c[i].outerHTML);
	}
}

// A function which restores children by Array inside parrent
function restoreChildren(parent) {
	// Checking if children elems exists
	if (children.length) {
		for (let i = 0; i < children.length; i++) {
			// add !!HTML!! of child into parent
			parent.innerHTML += children[i];
		}
		// turn array into empty back
		children = [];
	}
}

/* SEARCH HELPERS START */

// Print all elems from array which are contact and paste them into results
// (Calls when first letter typed and all contacts, stating which it letter could be printed)
function printAllFirstLetterElemsFromArray(data) {
	data.forEach(function(val) {
		// IF our element contains name, so its defenetly a contact (not a 'count' for instance)
		if (val.get('name')) {
			// Creating a template which contains view of our contact as a search result
			let searchResTemplate = 
			`<div name='${val.get('name')}' searchId='${val.get('id')}' class='sRes'>
				<div class='sResMainer'>
					<div class='square'></div>
					<div>
						<span class='nameSurname'>${val.get('name')} ${val.get('surname')} <br /></span>
						<span class='number'>${val.get('phoneNumber')}</span>
					</div>
				</div>
				<div class='delete deleteSearch'>X</div>
			</div>`;

			// Pasting contact into searchResults container
			document.getElementById("searchResults").innerHTML += searchResTemplate;
		}
	});
}

// Removing searchResultContainer (when input val is empty or bubble is closed)
function removeAllResults() {
	// !!!!!!!!!!!!!!!!!!IMPORTANT!!!!!!!!!!!!!!!!!!!!!!
	/* GIVE VAR needPrint VALUE TRUE BECAUSE USER CAN CLOSE THE WINDOW AND THAN IT WOULD BE FALSE
	SO WHEN USER WILL RETURN TO SEARCHBUBBLE HE WONT GET ANYTHING BECAUSE FIRST CONDITION
	check func. searchAndPrintContacts WONT WORK BUT THE FIRST LETTER(in input value) WILL APPEAR SO WE WILL GET
	WORKED THE SECOND CONDITION WHICH WILL CALL THE ERROR*/
	needPrint = true;

	// Checking if searchResults exists(not removed yet)
	if (document.getElementById("searchResults")) {
		// SearchResultWrapper which defenetly contains searchResults and removing it(searchResults)
		searchResultsContainerParent.removeChild(document.getElementById("searchResults"));
	}
	// Then restore all children which were contained there before typing
	restoreChildren(searchResultsContainerParent);
}

// A message that will say that during search nothing has been found
function notFoundMessage(isVisible) {
	let notFound = document.getElementById("searchNotFound");
	// If I have no match with DB, so I cant find anything, so I make notFound elem visible
	if (isVisible) notFound.style.display = 'block';
	// If opposit - invisible
	else notFound.style.display = 'none';
}

/* SEARCH HELPERS END */

// A function which counts or check if there any visible elements in haystack depending on needCount arg
function countOrCheckVisibleElems(selector, $needCount = false) {
	let isClear = true; // <- if there only INVISIBLE objects?
	let elems = document.querySelectorAll(selector); // getting all elems
	let count = 0; // a varriable which will count visible elems

	// If smth exists
	if (elems.length) {
		for (let i = 0; i < elems.length; i++) {
			// If its a visible element
			if (elems[i].style.display !== "none") {
				isClear = false;
				// To save time and resources
				if (!$needCount) break;
				count++; // itterating counter
			}
		}
	}
	if ($needCount) return count;
	return isClear;
}