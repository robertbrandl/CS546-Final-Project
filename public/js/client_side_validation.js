
function checkString(str, fieldName){
    if (!str || str === undefined){
        throw `${fieldName} is not supplied, null, undefined, 0, false, '', or NaN`;
    }
    if (typeof str !== 'string') {
        throw `${fieldName} is not a string`;
    }
    let trimStr = str.trim();
    if (trimStr.length === 0){
        throw `${fieldName} cannot be empty`;
    }
    return trimStr;
}
function checkLoginInput(
    emailAddress,
    password
){
    let email = checkString(emailAddress, "Email");
    if(!email.match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      )){
        throw `Email must be valid`
    }
    let pword = checkString(password, "Password");
    if (/\s/.test(pword)) throw "Password cannot contain spaces";
    if (pword.length < 8) throw "Password is not long enough";
    if ((/[A-Z]/).test(pword) === false) throw "Password must contain an uppercase letter";
    if (/\d/.test(pword) === false) throw "Password must contain a number";
    if (/[^a-zA-Z0-9]/.test(pword) === false) throw "Password must contain a special character";
    return true;
}
function checkRegisterInput(
    firstName,
    lastName,
    emailAddress,
    password,
    confirmPassword
) {
    let fname = checkString(firstName, "First Name");
    if (/\d/.test(fname)) throw "First Name cannot contain numbers";//source: https://stackoverflow.com/questions/5778020/check-whether-an-input-string-contains-a-number-in-javascript
    if (fname.length < 2 || fname.length > 25) throw "First Name length is invalid";
    let lname = checkString(lastName, "Last Name");
    if (/\d/.test(lname)) throw "Last Name cannot contain numbers";
    if (lname.length < 2 || lname.length > 25) throw "Last Name length is invalid";
    let email = checkString(emailAddress, "Email");
    //https://stackoverflow.com/questions/46155/how-can-i-validate-an-email-address-in-javascript
    if(!email.match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      )){
        throw `Email must be valid`
    }
    let pword = checkString(password, "Password");
    if (/\s/.test(pword)) throw "Password cannot contain spaces";
    if (pword.length < 8) throw "Password is not long enough";
    if ((/[A-Z]/).test(pword) === false) throw "Password must contain an uppercase letter";
    if (/\d/.test(pword) === false) throw "Password must contain a number";
    if (/[^a-zA-Z0-9]/.test(pword) === false) throw "Password must contain a special character";
    let cpword = checkString(confirmPassword, "Confirm password");
    if (pword !== cpword) throw "Passwords do not match";
    return true;
  }

function checkChangePasswordInput(
    oldPassword,
    newPassword
){
    let opword = checkString(oldPassword, "Old Password");
    if (/\s/.test(opword)) throw "Old Password cannot contain spaces";
    if (opword.length < 8) throw "Old Password is not long enough";
    if ((/[A-Z]/).test(opword) === false) throw "Old Password must contain an uppercase letter";
    if (/\d/.test(opword) === false) throw "Old Password must contain a number";
    if (/[^a-zA-Z0-9]/.test(opword) === false) throw "Old Password must contain a special character";
    let npword = checkString(newPassword, "New Password");
    if (/\s/.test(npword)) throw "New Password cannot contain spaces";
    if (npword.length < 8) throw "New Password is not long enough";
    if ((/[A-Z]/).test(npword) === false) throw "New Password must contain an uppercase letter";
    if (/\d/.test(npword) === false) throw "New Password must contain a number";
    if (/[^a-zA-Z0-9]/.test(npword) === false) throw "New Password must contain a special character";
    return true;
}

function checkCreateReviewInput(title, rating, content, watchAgain){
   let checkTitle = checkString(title, "Title");
   if (rating === undefined || rating === null || !rating){
    throw "The rating is not supplied, null, or undefined";
    }
    let rate = parseInt(rating);
    if (typeof rate !== 'number') {throw `${rating} is not a number`;}
    if (isNaN(rate)) {throw `${rating} is NaN`;}
    if (rate < 1 || rate === Infinity || rate > 10 || (parseFloat(rating) !== parseInt(rating))){throw 'Rating is not valid';}
   let checkContent=  checkString(content, "Review Content");
   //if (watchAgain === undefined || watchAgain === null){throw "watchAgain is null or undefined";}
	//if (typeof watchAgain !== "boolean"){throw "watchAgain is not a boolean";}
    //console.log(watchAgain);
    let watchBool;
    if (watchAgain == "true") {
        watchBool = true;
    }
    else if (!watchAgain || watchAgain===undefined) {
        watchBool = false;
    }
    else {
        throw "watchAgain is not a boolean";
    }
    return true;
}

function checkUpvote(upvote) {
    let upvoteBool;
    if (upvote == "true") {
        upvoteBool = true;
    }
    else if (!upvote || upvote===undefined) {
        upvoteBool = false;
    }
    else {
        throw "upvote is not a boolean";
    }
    return true;
}

let loginForm = document.getElementById('login-form');
let regForm = document.getElementById('registration-form');
let changePasswordForm = document.getElementById('change-password-form');
let createReviewForm = document.getElementById('create-review-form');
let editReviewForm = document.getElementById('edit-review-form');
let searchForm = document.getElementById('search-form');
let filterForm = document.getElementById('filter-form');
let sortForm = document.getElementById('sort-form');
if (loginForm) {
    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const email = document.getElementById('emailAddressInput').value;
        const password = document.getElementById('passwordInput').value;
        const errorContainer = document.getElementById('error-container');
        const errorTextElement = errorContainer.querySelector('.text-goes-here');
        const otherErrorTextElement = document.querySelector('.error');
        const formData = new FormData();
        formData.append('email', email);
        formData.append('password', password);

        fetch('/user/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                emailAddressInput: email,
                passwordInput: password
            })
        })
        .then(response => response.text()) 
        .then(data => {
            try {
                
                const jsonData = JSON.parse(data);
                if (jsonData.status === 'success') {
                    window.location.href = '/';  
                } else {
                    throw new Error(jsonData.message);
                }
            } catch (error) {
                errorTextElement.textContent = error.message;
                errorContainer.classList.remove('hidden');
                if (otherErrorTextElement) {
                    otherErrorTextElement.style.display = 'none';
                }
            }
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
    });
}
if (regForm) {
    const firstName = document.getElementById('firstNameInput');
    const lastName = document.getElementById('lastNameInput');
    const email = document.getElementById('emailAddressInput');
    const password= document.getElementById('passwordInput');
    const confirmPassword = document.getElementById('confirmPasswordInput');
    const errorContainer = document.getElementById('error-container');
    const errorTextElement =
    errorContainer.getElementsByClassName('text-goes-here')[0];
    const otherErrorTextElement =
      document.getElementsByClassName('error')[0];
    regForm.addEventListener('submit', (event) =>{
        try{
            errorContainer.classList.add('hidden');
            let registerR = checkRegisterInput(firstName.value, lastName.value, email.value, password.value, confirmPassword.value);
        }catch(e){
            event.preventDefault();
            const message = typeof e === 'string' ? e : e.message;
            errorTextElement.textContent = "Error: " + e;
            errorContainer.classList.remove('hidden');
            if (otherErrorTextElement){
                otherErrorTextElement.style.display = "none";
            }
        }
    });
}
if (changePasswordForm){
    const oldPassword = document.getElementById('oldPasswordInput');
    const newPassword = document.getElementById('newPasswordInput');
    const errorContainer = document.getElementById('error-container');
    const errorTextElement =
      errorContainer.getElementsByClassName('text-goes-here')[0];
    const otherErrorTextElement =
      document.getElementsByClassName('error')[0];
    changePasswordForm.addEventListener('submit', (event) =>{
        try{
            errorContainer.classList.add('hidden');
            let changepword = checkChangePasswordInput(oldPassword.value, newPassword.value);
        }catch(e){
            event.preventDefault();
            const message = typeof e === 'string' ? e : e.message;
            errorTextElement.textContent = "Error: " + e;
            errorContainer.classList.remove('hidden');
            if (otherErrorTextElement){
                otherErrorTextElement.style.display = "none";
            }
        }
    });
}

if (createReviewForm) {
 //titleInput, ratingInput, contentInput, watchAgainInput
 const title = document.getElementById('titleInput');
 const rating = document.getElementById('ratingInput');
 const content = document.getElementById('contentInput');
 const watchAgain = document.getElementById('watchAgainInput');
 //error-container
 const errorContainer = document.getElementById('error-container');
 const errorTextElement =
 errorContainer.getElementsByClassName('text-goes-here')[0];
 const otherErrorTextElement =
 document.getElementsByClassName('error')[0];
 createReviewForm.addEventListener('submit', (event) => {
    try {
        errorContainer.classList.add('hidden');
        let createRev = checkCreateReviewInput(title.value,rating.value,content.value, watchAgain.value);
    }
    catch(e) {
        event.preventDefault();
        const message = typeof e === 'string' ? e: e.message;
        errorTextElement.textContent = "Error: "+e;
        errorContainer.classList.remove('hidden');
        if (otherErrorTextElement) {
            otherErrorTextElement.style.display = "none";
        }
    }
    })
}
if (editReviewForm) {
    //titleInput, ratingInput, contentInput, watchAgainInput
    const title = document.getElementById('titleInput');
    const rating = document.getElementById('ratingInput');
    const content = document.getElementById('contentInput');
    const watchAgain = document.getElementById('watchAgainInput');
    //error-container
    const errorContainer = document.getElementById('error-container');
    const errorTextElement =
    errorContainer.getElementsByClassName('text-goes-here')[0];
    const otherErrorTextElement =
    document.getElementsByClassName('error')[0];
    editReviewForm.addEventListener('submit', (event) => {
       try {
           errorContainer.classList.add('hidden');
           let editRev = checkCreateReviewInput(title.value,rating.value,content.value, watchAgain.value);
       }
       catch(e) {
           event.preventDefault();
           const message = typeof e === 'string' ? e: e.message;
           errorTextElement.textContent = "Error: "+e;
           errorContainer.classList.remove('hidden');
           if (otherErrorTextElement) {
               otherErrorTextElement.style.display = "none";
           }
       }
       })
   }
if (searchForm){
    const term = document.getElementById('searchTerm');
    //error-container
    const errorContainer = document.getElementById('error-container-main');
    const errorTextElement =
    errorContainer.getElementsByClassName('text-goes-here-search')[0];
    searchForm.addEventListener('submit', (event) => {
        try {
            errorContainer.classList.add('hidden');
            checkString(term.value, "Search Term");
            term.value = term.value.trim();
        }
        catch(e) {
            event.preventDefault();
            const message = typeof e === 'string' ? e: e.message;
            errorTextElement.textContent = "Error: "+e;
            errorContainer.classList.remove('hidden');
        }
    })
}
if (filterForm){
    const genre = document.getElementById('filterGenre');
    //error-container
    const errorContainer = document.getElementById('error-container-main');
    const errorTextElement =
    errorContainer.getElementsByClassName('text-goes-here-search')[0];
    filterForm.addEventListener('submit', (event) => {
        try {
            errorContainer.classList.add('hidden');
            checkString(genre.value, "Filter Genre");
            genre.value = genre.value.trim();
            let allgenres = ['Comedy', 'History', 'Sports', 'Horror', 'Adventure', 'Crime', 'Supernatural', 'Action', 'Anime', 'Science-Fiction', 'Drama', 'Legal', 'Thriller', 'Fantasy', 'Family', 'War', 'Medical', 'Espionage', 'Romance', 'Music', 'Western', 'Mystery'];
            allgenres = allgenres.map(element => element.toLowerCase());
            if (!allgenres.includes(genre.value.toLowerCase())){ throw "Genre name is not valid";}
        }
        catch(e) {
            event.preventDefault();
            const message = typeof e === 'string' ? e: e.message;
            errorTextElement.textContent = "Error: "+e;
            errorContainer.classList.remove('hidden');
        }
    })
}
if (sortForm){
    const sortF = document.getElementById('sortFeature');
    const sortO = document.getElementById('sortOrder')
    //error-container
    const errorContainer = document.getElementById('error-container-main');
    const errorTextElement =
    errorContainer.getElementsByClassName('text-goes-here-search')[0];
    sortForm.addEventListener('submit', (event) => {
        try {
            errorContainer.classList.add('hidden');
            checkString(sortF.value, "Sort Feature");
            sortF.value = sortF.value.trim();
            let allfeatures = ['runtime', 'rating', 'rewatch'];
            if (!allfeatures.includes(sortF.value.toLowerCase())){throw "Sort feature is invalid"}
            let allorders = ['ascending', 'descending']
            if (!allorders.includes(sortO.value.toLowerCase())){throw "Order choice is invalid"}
        }
        catch(e) {
            event.preventDefault();
            const message = typeof e === 'string' ? e: e.message;
            errorTextElement.textContent = "Error: "+e;
            errorContainer.classList.remove('hidden');
        }
    })
}