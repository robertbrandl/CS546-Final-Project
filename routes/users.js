import {Router} from 'express';
const router = Router();
import {userData} from '../data/index.js';
import * as validation from '../validation.js';
import validator from 'email-validator';
router
  .route('/register')
  .get(async (req, res) => {
    if (req.session.user){
        return res.redirect('/');
    }
    else{
        return res.render('register', {title: "Register", notLoggedIn: true, error: false});
    }
  })
  .post(async (req, res) => {
    //code here for POST
    const createUserData = req.body;
    if (!createUserData || Object.keys(createUserData).length === 0) {
      return res
        .status(400)
        .render('register', {title: "Register", notLoggedIn: true, error: true, msg: "Error: Must enter data for the fields"});
    }
    let fname = "";
    try{
      fname = validation.checkString(createUserData.firstNameInput);
    }catch(e){
      return res.status(400).render('register', {title: "Register", notLoggedIn: true, error: true, msg: "Error: First Name is not valid"});
    }
    if (/\d/.test(fname)) return res.status(400).render('register', {title: "Register", notLoggedIn: true, error: true, msg: "Error: First Name cannot contain numbers"});//source: https://stackoverflow.com/questions/5778020/check-whether-an-input-string-contains-a-number-in-javascript
    if (fname.length < 2 || fname.length > 25) return res.status(400).render('register', {title: "Register", notLoggedIn: true, error: true, msg: "Error: First Name length is invalid"});
    let lname = "";
    try{
      lname = validation.checkString(createUserData.lastNameInput);
    }catch(e){
      return res.status(400).render('register', {title: "Register", notLoggedIn: true, error: true, msg: "Error: Last Name is not valid"});
    }
    if (/\d/.test(lname)) return res.status(400).render('register', {title: "Register", notLoggedIn: true, error: true, msg: "Error: Last Name cannot contain numbers"});
    if (lname.length < 2 || lname.length > 25) return res.status(400).render('register', {title: "Register", notLoggedIn: true, error: true, msg: "Error: Last Name length is invalid"});
    let email = "";
    try{
      email = validation.checkString(createUserData.emailAddressInput);
    }catch(e){
      return res.status(400).render('register', {title: "Register", notLoggedIn: true, error: true, msg: "Error: Email is not valid"});
    }
    email = email.toLowerCase();
    if (validator.validate(email) === false){return res.status(400).render('register', {title: "Register", notLoggedIn: true, error: true, msg: "Error: Invalid email"})}
    let pword = "";
    try{
      pword = validation.checkString(createUserData.passwordInput);
    }catch(e){
      return res.status(400).render('register', {title: "Register", notLoggedIn: true, error: true, msg: "Error: Password is not valid"});
    }
    if (/\s/.test(pword)) return res.status(400).render('register', {title: "Register", notLoggedIn: true, error: true, msg: "Error: Password cannot contain spaces"});
    if (pword.length < 8) return res.status(400).render('register', {title: "Register", notLoggedIn: true, error: true, msg: "Error: Password is not long enough"});
    if ((/[A-Z]/).test(pword) === false) return res.status(400).render('register', {title: "Register", notLoggedIn: true, error: true, msg: "Error: Password must contain an uppercase letter"});
    if (/\d/.test(pword) === false) return res.status(400).render('register', {title: "Register", notLoggedIn: true, error: true, msg: "Error: Password must contain a number"});
    if (/[^a-zA-Z0-9]/.test(pword) === false) return res.status(400).render('register', {title: "Register", notLoggedIn: true, error: true, msg: "Error: Password must contain a special character"});
    let cpword = "";
    try{
      cpword = validation.checkString(createUserData.confirmPasswordInput);
    }catch(e){
      return res.status(400).render('register', {title: "Register", notLoggedIn: true, error: true, msg: "Error: Confirm password does not match password"});
    }
    if (pword !== cpword) return res.status(400).render('register', {title: "Register", notLoggedIn: true, error: true, msg: "Error: Confirm password does not match password"});
    let result = undefined;
    try{
      result = await userData.registerUser(fname, lname, email, pword);
    }catch(e){
      return res.status(400).render('register', {title: "Register", notLoggedIn: true, error: true, msg: "Error: " + e});
    }
    if (result.insertedUser === true){
      return res.redirect("/login");
    }
    else{
      return res.status(500).render('register', {title: "Register", notLoggedIn: true, error: true, msg: "Internal Server Error"});
    }

  });

router
  .route('/login')
  .get(async (req, res) => {
    if (req.session.user){
        return res.redirect("/");
    }
    else{
        return res.render('login', {title: "Login", notLoggedIn: true});
    }
  })
  .post(async (req, res) => {
    //code here for POST
    const createUserData = req.body;
    if (!createUserData || Object.keys(createUserData).length === 0) {
      return res
        .status(400)
        .render('login', {title: "Login", notLoggedIn: true, error: true, msg: "Error: Must enter data for the fields"});
    }
    let email = "";
    try{
      email = validation.checkString(createUserData.emailAddressInput);
    }catch(e){
      return res.status(400).render('login', {title: "Login", notLoggedIn: true, error: true, msg: "Error: Email is not valid"});
    }
    email = email.toLowerCase();
    if (validator.validate(email) === false){return res.status(400).render('login', {title: "Login", notLoggedIn: true, error: true, msg: "Error: Invalid email"})}
    let pword = "";
    try{
      pword = validation.checkString(createUserData.passwordInput);
    }catch(e){
      return res.status(400).render('login', {title: "Login", notLoggedIn: true, error: true, msg: "Error: Password is not valid"});
    }
    if (/\s/.test(pword)) return res.status(400).render('login', {title: "Login", notLoggedIn: true, error: true, msg: "Error: Password cannot contain spaces"});
    if (pword.length < 8) return res.status(400).render('login', {title: "Login", notLoggedIn: true, error: true, msg: "Error: Password is not long enough"});
    if ((/[A-Z]/).test(pword) === false) return res.status(400).render('login', {title: "Login", notLoggedIn: true, error: true, msg: "Error: Password must contain an uppercase letter"});
    if (/\d/.test(pword) === false) return res.status(400).render('login', {title: "Login", notLoggedIn: true, error: true, msg: "Error: Password must contain a number"});
    if (/[^a-zA-Z0-9]/.test(pword) === false) return res.status(400).render('login', {title: "Login", notLoggedIn: true, error: true, msg: "Error: Password must contain a special character"});
    let result = undefined;
    try{
      result = await userData.loginUser(email, pword);
    }catch(e){
      return res.status(400).render('login', {title: "Login", notLoggedIn: true, error: true, msg: "Error: " + e});
    }
    if (result !== null){
      req.session.user= {firstName: result.firstName, lastName: result.lastName, emailAddress: result.emailAddress};
      return res.redirect("/");
    }
    else{
      return res.status(400).render('login', {title: "Login", notLoggedIn: true, error: true, msg: "Error: You did not provide a valid username and/or password"});
    }
  });

router
  .route('/account')
  .get(async (req, res) => {
    if (req.session.user){
        let user = await userData.getUser(req.session.user.emailAddress);
        let revs = undefined;
        try{
            revs = await userData.getReviewsForUser(user);
        }catch(e){
            if (req.session.user){
                return res.status(500).render("error", {title: "Error", notLoggedIn: false, firstName: req.session.user.firstName, code: 500, errorText: e})
            }
            else{
                return res.status(500).render("error", {title: "Error", notLoggedIn: true, code: 500, errorText: e})
            }
        }
        let ss = undefined;
        try{
            ss = await userData.getShowsForUser(user);
        }catch(e){
            if (req.session.user){
                return res.status(500).render("error", {title: "Error", notLoggedIn: false, firstName: req.session.user.firstName, code: 500, errorText: e})
            }
            else{
                return res.status(500).render("error", {title: "Error", notLoggedIn: true, code: 500, errorText: e})
            }
        }
        return res.render('useraccount', {title: "User Account", notLoggedIn: false, firstName: req.session.user.firstName, lastName: req.session.user.lastName, reviews: revs, savedshows: ss });
    }
    else{
        return res.status(401).render("error", {title: "Error", notLoggedIn: true, code: 401, errorText: "Error: You must be logged in to access this page."})
    }
  })
export default router;