import * as validation from "../validation.js";
import {ObjectId} from 'mongodb';
import {shows} from '../config/mongoCollections.js';
import {reviews} from '../config/mongoCollections.js';
import {users} from '../config/mongoCollections.js';

const create = async (
    showId,
    userId,
    showTitle,
    authorFirstName,
    authorLastName,
    title,
    rating,
    content,
    watchAgain
) => {
    let sId = validation.checkString(showId);
    const showCollection = await shows();
    let show = await showCollection.findOne({apiId: parseInt(showId)});
    if(!show){
        throw `Invalid show ID, does not exist`
    }
    if (!ObjectId.isValid(show._id)) throw 'invalid show ID';
    showTitle = show.name;
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
    if (rating < 1 || rating === Infinity || rating > 10 || (parseFloat(rating) !== parseInt(rating))){throw 'MaxCap is not valid';}
    let cont = validation.checkString(content);
    //if (watchAgain === undefined || watchAgain === null){throw "watchAgain is null or undefined";}
	//if (typeof watchAgain !== "boolean"){throw "watchAgain is not a boolean";}
    let watchBool;
    if (watchAgain == true) {
        watchBool = true;
    }
    else if (!watchAgain || watchAgain===undefined) {
        watchBool = false;
    }
    else {
        throw "watchAgain is not a boolean";
    }
    let upVotes = 0;
    let newReview = { 
        showId: show._id,
        userId: uId,
        showTitle: showTitle,
        authorFirstName: fname,
        authorLastName: lname,
        title: til,
        rating: rating,
        content: cont,
        watchAgain: watchBool,
        upvotes: upVotes
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
            averageRating: parseFloat(updatedAvgR.toFixed(1)),
            rewatchPercent: Math.round(updatedrew),
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
    //if (watchAgain === undefined || watchAgain === null){throw "watchAgain is null or undefined"}
	//if (typeof watchAgain !== "boolean"){throw "watchAgain is not a boolean"}
    let watchBool;
    if (watchAgain == true) {
        watchBool = true;
    }
    else if (!watchAgain || watchAgain===undefined) {
        watchBool = false;
    }
    else {
        throw "watchAgain is not a boolean";
    }
    const updatedReview = {
        title: til,
        rating: rating,
        content: cont,
        watchAgain: watchBool
    }
    const reviewCollection = await reviews();
    //get old rev to help recalculations
    let oldReview = await reviewCollection.findOne({_id: new ObjectId(rId)})
    let percent = undefined
    if(oldReview.watchAgain){
        percent = 100
    }else{
        percent = 0
    }
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

    //update shows collection 

    const showCollection = await shows();
    let showid = updatedInfo.showId
    let show = await showCollection.findOne({_id: new ObjectId(showid)});
    let avgR = show.averageRating;
    let totR = show.reviews.length;
    let rew = show.rewatchPercent;
    let updatedAvgR = 0;
    let updatedrew = 0;
    if (totR === 1){
        updatedAvgR = rating;
    } else{
        updatedAvgR = ((avgR * totR) - oldReview.rating + rating)/(totR)
    }
    if (totR === 1){
        if(watchAgain){
            updatedrew = 100
        }else{
            updatedrew = 0
        }
    }else{
        if (watchAgain == true){
            updatedrew = ((rew * totR) -  percent + 100)/(totR);
        }else{
            updatedrew = ((rew * totR) - percent)/(totR);
        }
    }
    const updateShow = await showCollection.updateOne(
        { _id: show._id },
        {
          $set: {
            averageRating: parseFloat(updatedAvgR.toFixed(1)),
            rewatchPercent: Math.round(updatedrew),
          }
        }
      );
	if (!updateShow.acknowledged)
		throw updateShow;

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
    let show = await showCollection.findOne({_id: new ObjectId(showid)});
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
            averageRating: parseFloat(updatedAvgR.toFixed(1)),
            rewatchPercent: Math.round(updatedrew),
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

const addUpvote = async(reviewId) => {
    let mid = validation.checkString(reviewId);
    if (!ObjectId.isValid(mid)) throw 'invalid object ID';
    const reviewCollection = await reviews();
    const review = await reviewCollection.findOne({_id: new ObjectId(mid)});
    let upVotes = review.upvotes;
    upVotes = upVotes + 1;
    const updatedReview = {
        upvotes: upVotes
    }
    const updatedInfo = await reviewCollection.findOneAndUpdate(
        { _id: new ObjectId(mid) },
        { $set: updatedReview },
        { returnDocument: 'after' } 
    );
     if (!updatedInfo) {
        //updating review failed
        throw "Could not update upvote count";
    }
    updatedInfo._id = updatedInfo._id.toString();
    return updatedInfo;
}
const removeUpvote = async(reviewId) => {
    let mid = validation.checkString(reviewId);
    if (!ObjectId.isValid(mid)) throw 'invalid object ID';
    const reviewCollection = await reviews();
    const review = await reviewCollection.findOne({_id: new ObjectId(mid)});
    let upVotes = review.upvotes;
    upVotes = upVotes - 1;
    const updatedReview = {
        upvotes: upVotes
    }
    const updatedInfo = await reviewCollection.findOneAndUpdate(
        { _id: new ObjectId(mid) },
        { $set: updatedReview },
        { returnDocument: 'after' } 
    );
     if (!updatedInfo) {
        //updating review failed
        throw "Could not update upvote count";
    }
    updatedInfo._id = updatedInfo._id.toString();
    return updatedInfo;
}

export default {create, update, remove,addUpvote,removeUpvote};