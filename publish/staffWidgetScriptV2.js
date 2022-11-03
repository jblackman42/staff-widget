const staffWidget = document.querySelector('#staff-widget');

const showStaffPopup = (group_id, id) => {
    const staffPopupContainer = document.createElement('div');
    staffPopupContainer.id = 'staff-popup-container';

    console.log('showing popup')

    const userGroup = allStaff.filter(group => group.Group_ID == group_id)[0]
    const user = userGroup ?  userGroup.Participants.filter(user => user.Contact_ID == id)[0] : null;
    if (!user) return;

    staffPopupContainer.innerHTML = `
        <div id="staff-popup">
            <button class="close-btn" onclick="hideStaffPopup()"><i class="material-icons">close</i></button>
            <div class="image-container">
                <img src="${user.Image_URL}" />
            </div>
            <div class="bio-info">
                <h1 class="bio-name">${user.Display_Name}</h1>
                <h3 class="bio-title">${user.Job_Title}</h3>
                <p class="bio-content">${user.Bio}</p>
                ${user.Email ? `<a href="mainto:${user.Email}" class="btn">Contact ${user.Display_Name.split(' ')[0]}</a>` : ''}
            </div>
        </div>
    `
    staffPopupContainer.style.display = 'grid';
    staffPopupContainer.style.visibility = 'visible';
    staffPopupContainer.style.zIndex = 999999;
    document.body.appendChild(staffPopupContainer)
}
const hideStaffPopup = () => {
    const staffPopupContainer = document.querySelector('#staff-popup-container')
    staffPopupContainer.style.display = 'none';
    staffPopupContainer.style.visibility = 'hidden';
    staffPopupContainer.style.zIndex = -1;
    document.body.removeChild(staffPopupContainer)
}

document.onclick = function(e){
    if(e.target.id == 'staff-popup-container'){
        hideStaffPopup();
    }
    if(e.target.id == 'staff-popup'){
        showStaffPopup();
    }
};

let allStaff, staff;

const getStaff = async () => await fetch('https://phc.events/api/widgets/staff')
    .then(response => response.json())
    .then(data => data.staff)

const emailStaff = async (Section_Id, Staff_Id) => {
    const email = await fetch(`https://phc.events/api/widgets/staff-email?sectionId=${Section_Id}&staffId=${Staff_Id}`)
        .then(response => response.json())
        .then(data => data.Email)

    window.open(`mailto:${email}`)
}

const createWidget = async () => {
    allStaff = await getStaff();
    staff = allStaff;
    staffWidget.innerHTML = `
    <div class="filter-container">
        <div class="input">
            <select id="staff-filter" onchange="updateFilters()">
                <option value="0">All Staff</option>
                <option value="1">Lead Pastors</option>
                <option value="2">Pastors</option>
                <option value="3">Directors</option>
                <option value="4">Support Staff</option>
            </select>
        </div>
        <div class="input search">
            <i class="material-icons">search</i>
            <input type="text" id="search" oninput="updateFilters()"/>
        </div>
    </div>
    <h1 id="warning-msg">No Results</h1>
    <div id="staff-container"></div>
    `
    showStaff()
}
const createStaffGroupHTML = (id, title) => {
    const staffContainer = document.getElementById('staff-container');
    staffContainer.innerHTML += `
    <div class="staff-group">
        <h1>${title}</h1>
        <div class="user-container" id="group-${id}"></div>
    </div>
    `
}

const createStaffCard = (group_id, id, display_name, Section_Id, Staff_Id, title, imageUrl, Bio) => {
    const groupElem = document.querySelector(`#group-${group_id}`);
    groupElem.innerHTML += `
        <div class="staff-card" id="staff-${id}">
            <img src="${imageUrl}" alt="staff headshot">
            <div id="staff-info">
                <p id="name">${display_name}</p>
                <p id="title">${title}</p>
                <button class="btn" onclick="emailStaff(${Section_Id}, ${Staff_Id})">Email ${display_name.split(' ')[0]}</button>
                ${Bio ? `<button id="info-link" onclick="showStaffPopup(${group_id}, ${id})">More Info</button>` : ''}
            </div>
        </div>
        `
    // ${phone ? `<a href="tel:${phone}">${phone}</a>` : ''}
}

let filterContactIDs = [];
const showStaff = () => {
    const staffContainer = document.getElementById('staff-container')
    const searchDOM = document.getElementById('search');;
    staffContainer.innerHTML = '';
    for (let i = 0; i < staff.length; i ++) {
        const {Group_ID, Group_Title, Participants} = staff[i];
        let hiddenGroup = false;

        if (searchDOM.value && Participants.filter(user => filterContactIDs.includes(user.Contact_ID)).length) {
            createStaffGroupHTML(Group_ID, Group_Title)
        } else if (!searchDOM.value && Participants.length) {
            createStaffGroupHTML(Group_ID, Group_Title)
        } else {
            hiddenGroup = true;
        }

        Participants.sort((a, b) => {
            let fa = a.Last_Name,
                fb = b.Last_Name;
        
            if (fa < fb) {
                return -1;
            }
            if (fa > fb) {
                return 1;
            }
            return 0;
        });

        for (let j = 0; j < Participants.length; j ++) {
            const {Contact_ID, Display_Name, Email, First_Name, Image_URL, Job_Title, Last_Name, Phone, Web_Page, Bio, Section_Id, Staff_Id} = Participants[j];
            if (!hiddenGroup && (!filterContactIDs.length || filterContactIDs.includes(Contact_ID))) createStaffCard(Group_ID, Contact_ID, Display_Name, Section_Id, Staff_Id, Job_Title, Image_URL, Bio)
        }
    }
}

const updateFilters = async () => {
    const dropdownDOM = document.getElementById('staff-filter');
    const searchDOM = document.getElementById('search');
    const warningMsg = document.getElementById('warning-msg')
    
    const filter = filterValues.filter(option => option.value == dropdownDOM.value)[0];

    staff = allStaff.filter(group => filter.Group_IDs.includes(group.Group_ID))

    const searchValue = searchDOM.value.toLowerCase();
    
    let visibleUsers = [].concat.apply([], staff.map(group => group.Participants.map(user => {
        return {
            Contact_ID: user.Contact_ID,
            name: user.Display_Name.toLowerCase(),
            First_Name: user.First_Name.toLowerCase(),
            Last_Name: user.Last_Name.toLowerCase()
        }
    })));
    
    visibleUsers = visibleUsers.filter(user => user.name.includes(searchValue) || user.First_Name.includes(searchValue) || user.Last_Name.includes(searchValue))
    filterContactIDs = visibleUsers.map(user => user.Contact_ID)

    if (!visibleUsers.length) {
        warningMsg.style.display = 'block';
        warningMsg.style.visibility = 'visible';
    } else {
        warningMsg.style.display = 'none';
        warningMsg.style.visibility = 'hidden';
    }

    return showStaff()
}


createWidget();