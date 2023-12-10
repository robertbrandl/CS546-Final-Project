import * as validation from "../validation.js";
import {ObjectId} from 'mongodb';
import {reviews} from '../config/mongoCollections.js';
const create = async (
    showId,
    userId,
    authorFirstName,
    authorLastName,
    title,
    rating,
    content,
    watchAgain
) => {
    let sId = validation.checkString(showId);
    if (!ObjectId.isValid(sId)) throw 'invalid object ID';
    let uId = validation.checkString(userId);
    if (!ObjectId.isValid(uId)) throw 'invalid user ID';
    let fname = validation.checkString(authorFirstName);
    let lname = validation.checkString(authorLastName);
    let til = validation.checkString(title);
    if (rating === undefined || rating === null || !rating){
        throw "The rating is not supplied, null, or undefined";
    }
    if (typeof rating !== 'number') {throw `${rating} is not a number`;}
    if (isNaN(rating)) {throw `${rating} is NaN`;}
    if (rating < 1 || rating === Infinity || rating > 10 || (parseFloat(rating) !== parseInt(rating))){throw 'MaxCap is not valid'}
    let cont = validation.checkString(content);
    if (watchAgain === undefined || watchAgain === null){throw "watchAgain is null or undefined"}
	if (typeof watchAgain !== "boolean"){throw "watchAgain is not a boolean"}
    let newReview = { 
        showId: sId,
        userId: uId,
        authorFirstName: fname,
        authorLastName: lname,
        title: til,
        rating: rating,
        content: cont,
        watchAgain: watchAgain
    }
    const reviewCollection = await reviews();
    const insertInfo = await reviewCollection.insertOne(newReview);
	if (!insertInfo.acknowledged || !insertInfo.insertedId)
		throw 'Could not add review';
    const newId = insertInfo.insertedId.toString();
    const review = await reviewCollection.findOne({_id: new ObjectId(newId)});
    //need to handle how it affects shows and users
    return review;
}

const update = async (
    reviewId,
    showId,
    userId,
    authorFirstName,
    authorLastName,
    title,
    rating,
    content,
    watchAgain
) => {
    let rId = validation.checkStrinf(reviewId);
    if (!ObjectId.isValid(rId)) throw 'invalid review ID';
    let sId = validation.checkString(showId);
    if (!ObjectId.isValid(sId)) throw 'invalid object ID';
    let uId = validation.checkString(userId);
    if (!ObjectId.isValid(uId)) throw 'invalid user ID';
    let fname = validation.checkString(authorFirstName);
    let lname = validation.checkString(authorLastName);
    let til = validation.checkString(title);
    if (rating === undefined || rating === null || !rating){
        throw "The rating is not supplied, null, or undefined";
    }
    if (typeof rating !== 'number') {throw `${rating} is not a number`;}
    if (isNaN(rating)) {throw `${rating} is NaN`;}
    if (rating < 1 || rating === Infinity || rating > 10 || (parseFloat(rating) !== parseInt(rating))){throw 'MaxCap is not valid'}
    let cont = validation.checkString(content);
    if (watchAgain === undefined || watchAgain === null){throw "watchAgain is null or undefined"}
	if (typeof watchAgain !== "boolean"){throw "watchAgain is not a boolean"}
    const updatedReview = {
        _id: rId,
        showId: sId,
        userId: uId,
        authorFirstName: fname,
        authorLastName: lname,
        title: til,
        rating: rating,
        content: cont,
        watchAgain: watchAgain
    }
    const reviewCollection = await reviews();
    const updatedInfo = await reviewCollection.findOneAndUpdate(updatedReview);
    if (!updatedInfo) {
        //updating review failed
        throw "Could not update review";
    }
    updatedInfo._id = updatedInfo._id.toString();
    return updatedInfo;
}

const remove = async (reviewId) => {
    let mid = helpers.checkString(reviewId);
    if (!ObjectId.isValid(mid)) throw 'invalid object ID';
    const reviewCollection = await reviews();
    const deletionInfo = await reviewCollection.findOneAndDelete({
        _id: new ObjectId(mid)
    });
    if (!deletionInfo) {
        throw `Could not delete event with id of ${mid}`;
    }
    //need to handle how it affects shows and users
    return {eventName: deletionInfo.eventName, deleted: true};
}
export default {create, update, remove};