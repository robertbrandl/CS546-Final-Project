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
    if (typeof rating !== 'number') {throw `${rating} is not a number`;}
    if (isNaN(rating)) {throw `${rating} is NaN`;}
    if (rating < 1 || rating === Infinity || rating > 10 || (parseFloat(rating) !== parseInt(rating))){throw 'MaxCap is not valid';}
   let checkContent=  checkString(content, "Review Content");
   if (watchAgain === undefined || watchAgain === null){throw "watchAgain is null or undefined";}
	if (typeof watchAgain !== "boolean"){throw "watchAgain is not a boolean";}
    return true;
}

let loginForm = document.getElementById('login-form');
let regForm = document.getElementById('registration-form');
let changePasswordForm = document.getElementById('change-password-form');
let createReviewForm = document.getElementById('create-review-form');
if (loginForm) {
    const email = document.getElementById('emailAddressInput');
    const password= document.getElementById('passwordInput');
    const errorContainer = document.getElementById('error-container');
    const errorTextElement =
      errorContainer.getElementsByClassName('text-goes-here')[0];
    const otherErrorTextElement =
      document.getElementsByClassName('error')[0];
    loginForm.addEventListener('submit', (event) =>{
        try{
            errorContainer.classList.add('hidden');
            let loginR = checkLoginInput(email.value, password.value);
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
/*if (loginForm) {
    const email = document.getElementById('emailAddressInput');
    const password= document.getElementById('passwordInput');
    const errorContainer = document.getElementById('error-container');
    const errorTextElement =
      errorContainer.getElementsByClassName('text-goes-here')[0];
    const otherErrorTextElement =
      document.getElementsByClassName('error')[0];
    loginForm.addEventListener('submit', async (event) =>{
        try{
            event.preventDefault();
            errorContainer.classList.add('hidden');
            let loginR = checkLoginInput(email.value, password.value);
            const response = await fetch('/login', { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: email.value,
                        password: password.value
                    })
                });
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
}*/
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
 console.log(watchAgain)
 //error-container
 const errorContainer = document.getElementById('error-container');
 const errorTextElement =
 errorContainer.getElementsByClassName('text-goes-here')[0];
 const otherErrorTextElement =
 document.getElementsByClassName('error')[0];
 regForm.addEventListener('submit', (event) => {
    try {
        errorContainer.classList.add('hidden');
        let createRev = checkCreateReviewInput(title.value,rating.value,content.value,watchAgain.value);
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