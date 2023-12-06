import * as validation from "../validation.js";
import {ObjectId} from 'mongodb';
import {users} from '../config/mongoCollections.js';
import {reviews} from '../config/mongoCollections.js';
import {shows} from '../config/mongoCollections.js';
import validator from 'email-validator';
import bcrypt from 'bcrypt';
const saltRounds = 16;
const registerUser = async (
    firstName,
    lastName,
    emailAddress,
    password
) => {
    let fname = validation.checkString(firstName);
    if (/\d/.test(fname)) throw "First Name cannot contain numbers";//source: https://stackoverflow.com/questions/5778020/check-whether-an-input-string-contains-a-number-in-javascript
    if (fname.length < 2 || fname.length > 25) throw "First Name length must be between 2 and 25";
    let lname = validation.checkString(lastName);
    if (/\d/.test(lname)) throw "Last Name cannot contain numbers";
    if (lname.length < 2 || lname.length > 25) throw "Last Name length must be between 2 and 25";
    let email = validation.checkString(emailAddress);
    email = email.toLowerCase();
    if (validator.validate(email) === false){throw "Invalid email"}
    const userCollection = await users();
    if (await userCollection.findOne({emailAddress: email}) !== null) throw "Email already in use";
    let pword = validation.checkString(password);
    if (/\s/.test(pword)) throw "Password cannot contain spaces";
    if (pword.length < 8) throw "Password must be at least 8 characters";
    if ((/[A-Z]/).test(pword) === false) throw "Password must contain an uppercase letter";
    if (/\d/.test(pword) === false) throw "Password must contain a number";
    if (/[^a-zA-Z0-9]/.test(pword) === false) throw "Password must contain a special character";
    const hash = await bcrypt.hash(pword, saltRounds);
    let newUser = {
        firstName: fname,
        lastName: lname,
        emailAddress: email,
        password: hash,
        reviews: [],
        shows: []
    }
    const insertInfo = await userCollection.insertOne(newUser);
    if (!insertInfo.acknowledged || !insertInfo.insertedId)
        throw 'Could not add user';
    return {insertedUser: true};
}
const loginUser = async (
    emailAddress, 
    password
) => {
    let email = validation.checkString(emailAddress);
    email = email.toLowerCase();
    if (validator.validate(email) === false){throw "Invalid email"}
    let pword = validation.checkString(password);
    if (/\s/.test(pword)) throw "Password cannot contain spaces";
    if (pword.length < 8) throw "Password is not long enough";
    if ((/[A-Z]/).test(pword) === false) throw "Password must contain an uppercase letter";
    if (/\d/.test(pword) === false) throw "Password must contain a number";
    if (/[^a-zA-Z0-9]/.test(pword) === false) throw "Password must contain a special character";
    const userCollection = await users();
    let foundUser = await userCollection.findOne({emailAddress: email});
    if (!foundUser) throw "Either the email address or password is invalid";
    let match = await bcrypt.compare(pword, foundUser.password);
    if (!match) throw "Either the email address or password is invalid";
    return foundUser;
}
const getUser = async (
    emailAddress
) => {
    let email = validation.checkString(emailAddress);
    email = email.toLowerCase();
    const userCollection = await users();
    if (validator.validate(email) === false){throw "Invalid email"}
    let foundUser = await userCollection.findOne({emailAddress: email});
    delete foundUser.password;
    return foundUser;
}
const getReviewsForUser = async (
    user
)=>{
    let revs = user.reviews;
    const reviewCollection = await reviews();
    let arr = [];
    for (let x of revs){
        let review = undefined;
        if (typeof x === "string"){
            review = await reviewCollection.findOne({_id: new ObjectId(x)});
        }
        else{
            review = await reviewCollection.findOne({_id: x});
        }
        arr.push(review);
    }
    return arr;
}
const getShowsForUser = async (
    user
)=>{
    let ss = user.shows;
    const showsCollection = await shows();
    let arr = [];
    for (let x of ss){
        let show = undefined;
        if (typeof x === "string"){
            show = await showsCollection.findOne({_id: new ObjectId(x)});
        }
        else{
            show = await showsCollection.findOne({_id: x});
        }
        arr.push(show);
    }
    return arr;
}
const saveShow = async () => {

}
const removeShow = async () => {

}
const changePassword = async (
    newPassword
) => {

}
export default {registerUser, loginUser, getUser, saveShow, removeShow, changePassword, getReviewsForUser, getShowsForUser};