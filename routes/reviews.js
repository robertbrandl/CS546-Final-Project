import {Router} from 'express';
const router = Router();
import {reviewData} from '../data/index.js';
import {showData} from '../data/index.js';
import {userData} from '../data/index.js';
import {reviews} from '../config/mongoCollections.js';
import {ObjectId} from 'mongodb';
import xss from 'xss';

import * as validation from '../validation.js';


//create a new review
router
.route('/:id/createreview')
.get(async (req, res) => {
    const userInfo = req.session.user;
    if (!userInfo) {
        //user is not logged in
        return res.redirect('/user/login');
    }
    let showId = req.params.id
    try{ //id validation
        showId = validation.checkString(showId)
        let numId = parseInt(showId)
        if (typeof numId !== "number" || isNaN(numId) || numId === Infinity) {
            throw `Show apiId is not valid or not a number`
        }
        
    }catch(e){
        return res.status(400).render("error", {title: "Error", notLoggedIn: false, firstName: req.session.user.firstName, code: 400, errorText: "Show apiId is not valid or not a number"})
    }
    let show = undefined
    try{ //try finding show
            show = await showData.getIndividualShow(showId);
    }catch(e){
            return res.status(404).render("error", {title: "Error", notLoggedIn: false, firstName: req.session.user.firstName, code: 404, errorText: "Show cannot be found"});
    }
    let showTitle = show.name;
    return res.render('createreview', {title: "Create a review for "+showTitle, notLoggedIn: false, firstName: req.session.user.firstName, 
    lastName: req.session.user.lastName, show_id: parseInt(showId)});
})
.post(async (req, res) => {
    const userInfo = req.session.user;
    if (!userInfo) {
        //user is not logged in
        return res.redirect('/login');
    }
    let showId = req.params.id
    try{ //id validation
        showId = validation.checkString(showId)
        let numId = parseInt(showId)
        if (typeof numId !== "number" || isNaN(numId) || numId === Infinity) {
            throw `Show apiId is not valid or not a number`
          }
    }catch(e){
        return res.status(400).render("error", {title: "Error", notLoggedIn: false, firstName: req.session.user.firstName, code: 400, errorText: "Show apiId is not valid or not a number"})
    }
    let show = undefined
    try{ //try finding show
        show = await showData.getIndividualShow(showId);
    }catch(e){
            return res.status(404).render("error", {title: "Error", notLoggedIn: false, firstName: req.session.user.firstName, code: 404, errorText: "Show cannot be found"});
    }
    let showTitle = show.name;
    const reviewInput = req.body;
    //check if user has posted a review for this show already
    let user = await userData.getUser(req.session.user.emailAddress);
    const userReviews = await userData.getReviewsForUser(user);
    for (let i=0; i<userReviews.length; i++) {
        if (userReviews[i].showId === showId) {
            //user has already posted a review for this show
            return res.status(409).render('error', {title: "Error", notLoggedIn:false, firstName: req.session.user.firstName, code: 409, errorText: "User has already posted a review for this show"});
        }
    }
    let bool = true;
    try {
        //Data Validation
        let uId = validation.checkString(req.session.user._id);
        let fname = validation.checkString(req.session.user.firstName);
        let lname = validation.checkString(req.session.user.lastName);
        let til = validation.checkString(reviewInput.titleInput);
        if (reviewInput.ratingInput === undefined || reviewInput.ratingInput === null || !reviewInput.ratingInput){
            throw "The rating is not supplied, null, or undefined";
        }
        if (typeof parseInt(reviewInput.ratingInput) !== 'number') {throw `${reviewInput.ratingInput} is not a number`;}
        if (isNaN(reviewInput.ratingInput)) {throw `${reviewInput.ratingInput} is NaN`;}
        if (reviewInput.ratingInput < 1 || reviewInput.ratingInput === Infinity || reviewInput.ratingInput > 10 || (parseFloat(reviewInput.ratingInput) !== parseInt(reviewInput.ratingInput))){throw `${reviewInput.ratingInput} must be integer from 1-10`}
        let cont = validation.checkString(reviewInput.contentInput);
        if (!reviewInput.watchAgainInput){
            bool = false;
        }
        else if (reviewInput.watchAgainInput === "true"){
            bool = true;
        }
        else{
            throw "watchAgain is not a boolean";
        }
    }
    catch(e) {
        res.status(400).render('createreview', {title: "Create a review for "+showTitle, notLoggedIn: false, firstName: req.session.user.firstName, 
        lastName: req.session.user.lastName, show_id: showId, error: e});
    }
    try {
        //Insert the review
        const newReview = await reviewData.create(
            showId,
            req.session.user._id,
            req.session.user.firstName,
            req.session.user.lastName,
            reviewInput.titleInput,
            parseInt(reviewInput.ratingInput),
            reviewInput.contentInput,
            bool
        );
        if (newReview !== undefined) {
        //if successful, redirect to individual show page
            return res.redirect('/shows/'+showId);
        }
    }
    catch(e) {
        //could not create review
        return res.render('createreview', {title: "Create a review for "+showTitle, notLoggedIn: false, firstName: req.session.user.firstName, 
        lastName: req.session.user.lastName, show_id: showId, error: e});
    }
});
//delete existing review
router
.route('/delete/:id')
.get(async (req,res) => {
    //remove a review
    //req.params.id is review id
    const reviewId = req.params.id.trim();
    const userInfo = req.session.user;
    if (!userInfo) {
        //user is not logged in
        return res.redirect('/user/login');
    }
    //data validation
    try {
        let rId = validation.checkString(reviewId);
        if (!ObjectId.isValid(rId)) throw 'invalid review ID';
    }
    catch(e) {
        res.status(400).render('error', {title:"Error", notLoggedIn: false, code:400,errorText:'invalid review ID'});
    }
    try {
        let deletedReview = await reviewData.remove(reviewId);
        if (deletedReview !== undefined) {
            return res.redirect('/user/account');
        }
    }
    catch(e) {
        return res.status(500).render('error', {title:"Error", notLoggedIn: false, code:500,errorText:e});
    }
});
//edit existing review
router
.route('/edit/:id')
.get(async (req, res) => {
    const userInfo = req.session.user;
    if (!userInfo) {
        //user is not logged in
        return res.redirect('/login');
    }
    //id validation
    let reviewId = req.params.id.trim();

    try{
        reviewId = validation.checkString(reviewId)
        if (!ObjectId.isValid(reviewId)) throw 'invalid review id';
    }catch(e){
        return res.status(400).render("error", {title: "Error", notLoggedIn: false, firstName: req.session.user.firstName, code: 400, errorText: e})
    }

    //get review
    let review = undefined
    try{
        const reviewCollection = await reviews();
        review = await reviewCollection.findOne({_id: new ObjectId(reviewId)});
        if (!review){
            throw `No review with that ID`
        }
    }catch(e){
        return res.status(404).render("error", {title: "Error", notLoggedIn: false, firstName: req.session.user.firstName, code: 404, errorText: e});
    }

    return res.render('editreview', {title: "Edit Review", notLoggedIn: false, error: false});

})
.post(async (req,res) => {
    //update a review
    const reviewId = req.params.id.trim();
    const reviewInput = req.body;
    const userInfo = req.session.user;
    if (!userInfo) {
        //user is not logged in
        return res.redirect('/login');
    }
    //data validation
    try {
        let rId = validation.checkString(reviewId);
        if (!ObjectId.isValid(rId)) throw 'invalid review id';
        let til = validation.checkString(reviewInput.title);
        if (reviewInput.rating === undefined || reviewInput.rating === null || !reviewInput.rating){
            throw "The rating is not supplied, null, or undefined";
        }
        if (typeof reviewInput.rating !== 'number') {throw `${reviewInput.rating} is not a number`;}
        if (isNaN(reviewInput.rating)) {throw `${reviewInput.rating} is NaN`;}
        if (reviewInput.rating < 1 || reviewInput.rating === Infinity || reviewInput.rating > 10 || (parseFloat(reviewInput.rating) !== parseInt(reviewInput.rating))){throw `${reviewInput.rating} must be integer from 1-10`}
        let cont = validation.checkString(reviewInput.content);
        if (reviewInput.watchAgain === undefined || reviewInput.watchAgain === null){throw "watchAgain is null or undefined"}
        if (typeof reviewInput.watchAgain !== "boolean"){throw "watchAgain is not a boolean"}
    }
    catch(e) {
        res.status(400).redirect('error', {title:"Error", notLoggedIn: false, code:400,errorText:e});
    }
    try {
        //try to update
        const updated = await reviewData.update(
                reviewId,
                reviewInput.title,
                reviewInput.rating,
                reviewInput.content,
                reviewInput.watchAgain
            );
        if (updated !== undefined) {
            return res.redirect('/user/account');
        }  
    }
    catch(e) {
        res.status(500).redirect('error', {title:"Error", notLoggedIn: false, code:500,errorText:'review could not be updated'});
    }
});

export default router;