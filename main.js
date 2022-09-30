const staffWidget = document.querySelector('#staff-widget');
const createStaffGroupHTML = (id, title) => {
    staffWidget.innerHTML += `
<div class="staff-group" id="group-${id}">
    <h1>${title}</h1>
</div>
    `
}

const createStaffCard = (group_id, id, display_name, email, phone, title, imageUrl) => {
    const groupElem = document.querySelector(`#group-${group_id}`);
    groupElem.innerHTML += `
<div class="staff-card" id="staff-${id}">
    <img src="${imageUrl}" alt="staff headshot">
    <p>${display_name}</p>
    <p>${title}</p>
    ${email ? `<a href="mailto:${email}">${email}</a>` : ''}
    ${phone ? `<a href="tel:${phone}">${phone}</a>` : ''}
</div>
    `
}

const formatStaff = async () => {
    const staff = await fetch('http://localhost:3000/api/widgets/staff')
        .then(response => response.json())
        .then(data => data.staff)

    console.log(staff)
    for (let i = 0; i < staff.length; i ++) {
        const {Group_ID, Group_Title, Participants} = staff[i];
        createStaffGroupHTML(Group_ID, Group_Title)

        for (let j = 0; j < Participants.length; j ++) {
            const {Contact_ID, Display_Name, Email, First_Name, Image_URL, Job_Title, Last_Name, Phone} = Participants[j];
            createStaffCard(Group_ID, Contact_ID, Display_Name, Email, Phone, Job_Title, Image_URL)
        }
    }
}
formatStaff()