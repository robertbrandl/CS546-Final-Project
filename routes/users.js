import {Router} from 'express';
const router = Router();
import {userData} from '../data/index.js';
import * as validation from '../validation.js';
import validator from 'email-validator';
import xss from 'xss';
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
      fname = validation.checkString(xss(createUserData.firstNameInput));
    }catch(e){
      return res.status(400).render('register', {title: "Register", notLoggedIn: true, error: true, msg: "Error: First Name is not valid"});
    }
    if (/\d/.test(fname)) return res.status(400).render('register', {title: "Register", notLoggedIn: true, error: true, msg: "Error: First Name cannot contain numbers"});//source: https://stackoverflow.com/questions/5778020/check-whether-an-input-string-contains-a-number-in-javascript
    if (fname.length < 2 || fname.length > 25) return res.status(400).render('register', {title: "Register", notLoggedIn: true, error: true, msg: "Error: First Name length is invalid"});
    let lname = "";
    try{
      lname = validation.checkString(xss(createUserData.lastNameInput));
    }catch(e){
      return res.status(400).render('register', {title: "Register", notLoggedIn: true, error: true, msg: "Error: Last Name is not valid"});
    }
    if (/\d/.test(lname)) return res.status(400).render('register', {title: "Register", notLoggedIn: true, error: true, msg: "Error: Last Name cannot contain numbers"});
    if (lname.length < 2 || lname.length > 25) return res.status(400).render('register', {title: "Register", notLoggedIn: true, error: true, msg: "Error: Last Name length is invalid"});
    let email = "";
    try{
      email = validation.checkString(xss(createUserData.emailAddressInput));
    }catch(e){
      return res.status(400).render('register', {title: "Register", notLoggedIn: true, error: true, msg: "Error: Email is not valid"});
    }
    email = email.toLowerCase();
    if (validator.validate(email) === false){return res.status(400).render('register', {title: "Register", notLoggedIn: true, error: true, msg: "Error: Invalid email"})}
    let pword = "";
    try{
      pword = validation.checkString(xss(createUserData.passwordInput));
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
      cpword = validation.checkString(xss(createUserData.confirmPasswordInput));
    }catch(e){
      return res.status(400).render('register', {title: "Register", notLoggedIn: true, error: true, msg: "Error:Confirm password does not match password"});
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
      email = validation.checkString(xss(createUserData.emailAddressInput));
    }catch(e){
      return res.status(400).render('login', {title: "Login", notLoggedIn: true, error: true, msg: "Error: Email is not valid"});
    }
    email = email.toLowerCase();
    if (validator.validate(email) === false){return res.status(400).render('login', {title: "Login", notLoggedIn: true, error: true, msg: "Error: Invalid email"})}
    let pword = "";
    try{
      pword = validation.checkString(xss(createUserData.passwordInput));
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
      let user = await userData.getUser(req.session.user.emailAddress);
      req.session.user._id = user._id;
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
        return res.status(401).render("error", {title: "Error", notLoggedIn: true, code: 401, errorText: "You must be logged in to access this page."})
    }
  })
router.route('/logout').get(async (req, res) => {
    //code here for GET
    req.session.destroy();
    return res.redirect("/");
  });
router
  .route('/saveshow/:id')
  .get(async (req, res) => {
    let id = xss(req.params.id);
    try{
        id = validation.checkString(id);
        let numId = parseInt(id);
        if (typeof numId !== "number" || isNaN(numId) || numId === Infinity) {
          throw `Show apiId is not valid or not a number`
        }
    }catch(e){
        if (req.session.user){
            return res.status(400).render("error", {title: "Error", notLoggedIn: false, firstName: req.session.user.firstName, code: 400, errorText: "Show apiId is not valid or not a number"})
        }
        else{
            return res.status(400).render("error", {title: "Error", notLoggedIn: true, code: 400, errorText: "Show apiId is not valid or not a number"})
        }
    }
    if (req.session.user){
        let user = undefined;
        try{
            user = await userData.getUser(req.session.user.emailAddress);
        }catch(e){
            return res.status(404).render("error", {title: "Error", notLoggedIn: false, firstName: req.session.user.firstName, code: 404, errorText: "User cannot be found"});
        }
        let show = undefined;
        try{
            show = await userData.getShow(id);
        }catch(e){
            return res.status(404).render("error", {title: "Error", notLoggedIn: false, firstName: req.session.user.firstName, code: 404, errorText: "Show cannot be found"});
        }
        try{
            let res = await userData.saveShow(user, show);
            if (res.changed === false){
                return res.status(409).render("error", {title: "Error", notLoggedIn: false, firstName: req.session.user.firstName, code: 409, errorText: "Show is already saved!"});
            }
        }catch(e){
            return res.status(404).render("error", {title: "Error", notLoggedIn: false, firstName: req.session.user.firstName, code: 404, errorText: e});
        }
        return res.redirect(`/shows/${id}`);
    }
    else{
        return res.redirect(`/shows/${id}`);
    }
  })
router
  .route('/removeshow/:id')
  .get(async (req, res) => {
    let id = xss(req.params.id);
    try{
        id = validation.checkString(id);
        let numId = parseInt(id);
        if (typeof numId !== "number" || isNaN(numId) || numId === Infinity) {
          throw `Show apiId is not valid or not a number`
        }
    }catch(e){
        if (req.session.user){
            return res.status(400).render("error", {title: "Error", notLoggedIn: false, firstName: req.session.user.firstName, code: 400, errorText: "Show apiId is not valid or not a number"})
        }
        else{
            return res.status(400).render("error", {title: "Error", notLoggedIn: true, code: 400, errorText: "Show apiId is not valid or not a number"})
        }
    }
    if (req.session.user){
        let user = undefined;
        try{
            user = await userData.getUser(req.session.user.emailAddress);
        }catch(e){
            return res.status(404).render("error", {title: "Error", notLoggedIn: false, firstName: req.session.user.firstName, code: 404, errorText: "User cannot be found"});
        }
        let show = undefined;
        try{
            show = await userData.getShow(id);
        }catch(e){
            return res.status(404).render("error", {title: "Error", notLoggedIn: false, firstName: req.session.user.firstName, code: 404, errorText: "Show cannot be found"});
        }
        try{
            await userData.removeShow(user, show);
        }catch(e){
            return res.status(404).render("error", {title: "Error", notLoggedIn: false, firstName: req.session.user.firstName, code: 404, errorText: e});
        }
        return res.redirect(`/user/account`);
    }
    else{
        return res.redirect(`/user/account`);
    }
  })

router
  .route('/changepassword')
  .get(async (req, res) => {
    if (req.session.user){
        return res.render('changepassword', {title: "Change Password", notLoggedIn: false, firstName: req.session.user.firstName});
    }
    else{
        return res.status(401).render("error", {title: "Error", notLoggedIn: true, code: 401, errorText: "You must be logged in to access this page"});
    }
  })
  .post(async (req, res) => {
    //code here for POST
    if (req.session.user){
        const createUserData = req.body;
        if (!createUserData || Object.keys(createUserData).length === 0) {
        return res
            .status(400)
            .render('changepassword', {title: "Change Password", notLoggedIn: false, firstName: req.session.user.firstName, error: true, msg: "Error: Must enter data for the fields"});
        }
        let oldpword = "";
        try{
            oldpword = validation.checkString(xss(createUserData.oldPasswordInput));
        }catch(e){
            return res.status(400).render('changepassword', {title: "Change Password", notLoggedIn: false, firstName: req.session.user.firstName, error: true, msg: "Error: Current Password is not valid"});
        }
        if (/\s/.test(oldpword)) return res.status(400).render('changepassword', {title: "Change Password", notLoggedIn: false, firstName: req.session.user.firstName, error: true, msg: "Error: Current Password cannot contain spaces"});
        if (oldpword.length < 8) return res.status(400).render('changepassword', {title: "Change Password", notLoggedIn: false, firstName: req.session.user.firstName, error: true, msg: "Error: Current Password is not long enough"});
        if ((/[A-Z]/).test(oldpword) === false) return res.status(400).render('changepassword', {title: "Change Password", notLoggedIn: false, firstName: req.session.user.firstName, error: true, msg: "Error: Current Password must contain an uppercase letter"});
        if (/\d/.test(oldpword) === false) return res.status(400).render('changepassword', {title: "Change Password", notLoggedIn: false, firstName: req.session.user.firstName, error: true, msg: "Error: Current Password must contain a number"});
        if (/[^a-zA-Z0-9]/.test(oldpword) === false) return res.status(400).render('changepassword', {title: "Change Password", notLoggedIn: false, firstName: req.session.user.firstName, error: true, msg: "Error: Current Password must contain a special character"});
        let newpword = "";
        try{
            newpword = validation.checkString(xss(createUserData.newPasswordInput));
        }catch(e){
            return res.status(400).render('changepassword', {title: "Change Password", notLoggedIn: false, firstName: req.session.user.firstName, error: true, msg: "Error: Current Password is not valid"});
        }
        if (/\s/.test(newpword)) return res.status(400).render('changepassword', {title: "Change Password", notLoggedIn: false, firstName: req.session.user.firstName, error: true, msg: "Error: New Password cannot contain spaces"});
        if (newpword.length < 8) return res.status(400).render('changepassword', {title: "Change Password", notLoggedIn: false, firstName: req.session.user.firstName, error: true, msg: "Error: New Password is not long enough"});
        if ((/[A-Z]/).test(newpword) === false) return res.status(400).render('changepassword', {title: "Change Password", notLoggedIn: false, firstName: req.session.user.firstName, error: true, msg: "Error: New Password must contain an uppercase letter"});
        if (/\d/.test(newpword) === false) return res.status(400).render('changepassword', {title: "Change Password", notLoggedIn: false, firstName: req.session.user.firstName, error: true, msg: "Error: New Password must contain a number"});
        if (/[^a-zA-Z0-9]/.test(newpword) === false) return res.status(400).render('changepassword', {title: "Change Password", notLoggedIn: false, firstName: req.session.user.firstName, error: true, msg: "Error: New Password must contain a special character"});
        if (oldpword === newpword) return res.status(400).render('changepassword', {title: "Change Password", notLoggedIn: false, firstName: req.session.user.firstName, error: true, msg: "Error: New password cannot be the same as your current password"});
        let user = await userData.getUser(req.session.user.emailAddress);
        let result = undefined;
        try{
            result = await userData.changePassword(user, oldpword, newpword);
            return res.redirect("/user/account");
        }catch(e){
            let codenum = parseInt(e.substring(0,3));
            return res.status(codenum).render("changepassword", {title: "Change Password", notLoggedIn: false, firstName: req.session.user.firstName, error: true, msg: "Error: " + e.substring(5)})
        }
    }
    else{
        return res.status(401).render("error", {title: "Error", notLoggedIn: true, code: 401, errorText: "You must be logged in to access this page"});
    }
    })
export default router;