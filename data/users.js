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
        shows: [],
        userUpvotes: []
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
const getShow = async (
    apiId
) =>{
    let id = validation.checkString(apiId);
    let numId = parseInt(id);
    if (typeof numId !== "number" || isNaN(numId) || numId === Infinity) throw "Api Id is not valid";
    const showCollection = await shows();
    let show = await showCollection.findOne({apiId: numId});
    if (show === null){
        throw "Show not found";
    }
    else{
        return show;
    }
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
const saveShow = async (
    user,
    show
) => {
    //updated saved shows array
    let ss = user.shows;
    if (!ss.includes(show._id.toString())) {
        ss.push(show._id.toString());
        
        //updated user in collection
        const userCollection = await users();
        const updatedInfo = await userCollection.findOneAndUpdate(
            {_id: user._id},
            {$set: {shows: ss}},
            {returnDocument: 'after'}
        );
        if (!updatedInfo) {
            throw `User not found or could not successfully update saved shows`;
        }
        return {changed:true, updatedInfo:updatedInfo} 
    }
    else{
        return {changed:false, updatedInfo:updatedInfo}
    }

}
const removeShow = async (
    user,
    show
) => {
    //updated saved shows array
    let ss = user.shows
    let index = ss.indexOf(show._id.toString())
    if (index == -1){
        throw `Show not found`
    }
    ss.splice(index, 1)

    //updated user in collection
    const userCollection = await users();
    const updatedInfo = await userCollection.findOneAndUpdate(
        {_id: user._id},
        {$set: {shows: ss}},
        {returnDocument: 'after'}
      );
    if (!updatedInfo) {
        throw `User not found or could not successfully update saved shows`;
    }
    return {changed:true, updatedInfo:updatedInfo} 
}

const changePassword = async (
    user,
    oldPassword,
    newPassword
) => {
    //old password validation
    let oldPword = validation.checkString(oldPassword);
    if (/\s/.test(oldPword)) throw "400: Old password cannot contain spaces";
    if (oldPword.length < 8) throw "400: Old password is not long enough";
    if ((/[A-Z]/).test(oldPword) === false) throw "400: Old password must contain an uppercase letter";
    if (/\d/.test(oldPword) === false) throw "400: Old password must contain a number";
    if (/[^a-zA-Z0-9]/.test(oldPword) === false) throw "400: Old password must contain a special character";

    //new password validation
    let newPword = validation.checkString(newPassword);
    if (/\s/.test(newPword)) throw "400: New password cannot contain spaces";
    if (newPword.length < 8) throw "400: New password is not long enough";
    if ((/[A-Z]/).test(newPword) === false) throw "400: New password must contain an uppercase letter";
    if (/\d/.test(newPword) === false) throw "400: New password must contain a number";
    if (/[^a-zA-Z0-9]/.test(newPword) === false) throw "400: New password must contain a special character";
    //hash new password
    const hashnew = await bcrypt.hash(newPword, saltRounds);

    //old password comparison
    const userCollection = await users();
    let foundUser = await userCollection.findOne({_id: user._id});
    if (!foundUser) throw "404: User not found";
    let match = await bcrypt.compare(oldPword, foundUser.password);
    if (!match) throw "400: Current Password does not match your stored current password.";

    let same = await bcrypt.compare(newPword, foundUser.password);
    if (same) throw "400: New Password matches your stored current password.";

    //update with new password
    const updatedInfo = await userCollection.findOneAndUpdate(
        {_id: user._id},
        {$set: { password: hashnew }},
        {returnDocument: 'after'}
      );
    if (!updatedInfo) {
        throw `500: User not found or could not successfully update password`;
    }
    return {changed:true, updatedInfo:updatedInfo} 
}
const updateUpvoteForUser = async (
    user, rId
)=> {
    //userUpvotes = arr of obj {reviewId: id, isUpvoted: true/false}
    const userCollection = await users();
    let upvoteArr = user.userUpvotes;
    let upvoteAdded = false;
    let isFound = false;
    for (let i=0; i<upvoteArr.length; i++) {
        if (upvoteArr[i].reviewId === rId) {
            isFound = true;
            if (upvoteArr[i].isUpvoted=== true) {
                //user already upvoted this review
                //now remove the upvote instead
                upvoteArr[i].isUpvoted = false;
                upvoteAdded = false;
            }
            else {
                upvoteArr[i].isUpvoted = true;
                upvoteAdded = true;
            }
        }
    }
    if (isFound === false) {
        upvoteArr.push({reviewId: rId, isUpvoted: true});
        upvoteAdded = true;
    }
    const updatedInfo = await userCollection.findOneAndUpdate(
        {_id: user._id},
        {$set: {userUpvotes: upvoteArr}},
        {returnDocument: 'after'}
      );
    if (!updatedInfo) {
        throw `500: User not found or could not successfully update upvotes`;
    }
    return upvoteAdded;
}
export default {registerUser, loginUser, getUser, saveShow, removeShow, changePassword, getReviewsForUser, getShowsForUser, getShow, updateUpvoteForUser};