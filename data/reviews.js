import * as validation from "../validation.js";
import {ObjectId} from 'mongodb';
import {shows} from '../config/mongoCollections.js';
import {reviews} from '../config/mongoCollections.js';
import {users} from '../config/mongoCollections.js';

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
    const showCollection = await shows();
    let show = await showCollection.findOne({_id: new ObjectId(showId)});
    if(!show){
        throw `Invalid show ID, does not exist`
    }
    if (!ObjectId.isValid(show._id)) throw 'invalid show ID';
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
    //handles shows and reviews
    let avgR = show.averageRating;
    let totR = show.reviews.length;
    let rew = show.rewatchPercent;
    let updatedAvgR = 0;
    let updatedrew = 0;
    if (avgR === 0){
        updatedAvgR = review.rating;
    } else{
        updatedAvgR = ((avgR * totR) + review.rating)/(totR + 1);
    }
    if (avgR === 0){
        if (review.watchAgain == true){
            updatedrew = 100
        }else{
            updatedrew = 0
        }
    }else{
        if (review.watchAgain == true){
            updatedrew = ((rew * totR) + 100)/(totR + 1);
        }else{
            updatedrew = ((rew * totR) + 0)/(totR + 1);
        }
    }
    const updateShow = await showCollection.updateOne(
        { _id: show._id },
        {
          $push: { reviews: review._id },
          $set: {
            averageRating: updatedAvgR,
            rewatchPercent: updatedrew,
          }
        }
      );
	if (!updateShow.acknowledged)
		throw updateShow;
    const userCollection = await users();
    const updateUser = await userCollection.updateOne({_id: new ObjectId(uId)}, {$push: {reviews: review._id}});
	if (!updateUser.acknowledged)
		throw updateUser;
    return review;
}

const update = async (
    reviewId,
    title,
    rating,
    content,
    watchAgain
) => {
    let rId = validation.checkString(reviewId);
    if (!ObjectId.isValid(rId)) throw 'invalid review ID';
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
        title: til,
        rating: rating,
        content: cont,
        watchAgain: watchAgain
    }
    const reviewCollection = await reviews();
    const updatedInfo = await reviewCollection.findOneAndUpdate(
        { _id: new ObjectId(rId) },
        { $set: updatedReview },
        { returnDocument: 'after' } 
    );
     if (!updatedInfo) {
        //updating review failed
        throw "Could not update review";
    }
    updatedInfo._id = updatedInfo._id.toString();
    return updatedInfo;
}

const remove = async (reviewId) => {
    let mid = validation.checkString(reviewId);
    if (!ObjectId.isValid(mid)) throw 'invalid object ID';
    const reviewCollection = await reviews();
    const review = await reviewCollection.findOne({_id: new ObjectId(mid)});
    let showid = review.showId;
    let uId = review.userId;
    let revid = review._id;
    const deletionInfo = await reviewCollection.findOneAndDelete({
        _id: new ObjectId(mid)
    });
    if (!deletionInfo) {
        throw `Could not delete event with id of ${mid}`;
    }
    //need to handle how it affects shows and users
    const showCollection = await shows();
    let show = await showCollection.findOne({apiId: parseInt(showid)});
    let avgR = show.averageRating;
    let totR = show.reviews.length;
    let rew = show.rewatchPercent;
    let updatedAvgR = 0;
    let updatedrew = 0;
    if (totR === 1){
        updatedAvgR = 0;
    } else{
        updatedAvgR = ((avgR * totR) - review.rating)/(totR - 1);
    }
    if (totR === 1){
        updatedrew = 0;
    }else{
        if (review.watchAgain == true){
            updatedrew = ((rew * totR) - 100)/(totR - 1);
        }else{
            updatedrew = ((rew * totR) - 0)/(totR - 1);
        }
    }
    const updateShow = await showCollection.updateOne(
        { _id: show._id },
        {
          $pull: { reviews: review._id },
          $set: {
            averageRating: updatedAvgR,
            rewatchPercent: updatedrew,
          }
        }
      );
	if (!updateShow.acknowledged)
		throw updateShow;
    const userCollection = await users();
    const updateUser = await userCollection.updateOne({_id: new ObjectId(uId)}, {$pull: {reviews: review._id}});
	if (!updateUser.acknowledged)
		throw updateUser;
    return {eventName: deletionInfo.eventName, deleted: true};
}
export default {create, update, remove};