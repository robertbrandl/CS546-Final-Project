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
    let showId = xss(req.params.id)
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
    let showId = xss(req.params.id)
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
        if (userReviews[i].showId === show.showId) {
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
        let til = validation.checkString(xss(reviewInput.titleInput));
        if (xss(reviewInput.ratingInput) === undefined || reviewInput.ratingInput === null || !reviewInput.ratingInput){
            throw "The rating is not supplied, null, or undefined";
        }
        if (typeof parseInt(reviewInput.ratingInput) !== 'number') {throw `${reviewInput.ratingInput} is not a number`;}
        if (isNaN(reviewInput.ratingInput)) {throw `${reviewInput.ratingInput} is NaN`;}
        if (reviewInput.ratingInput < 1 || reviewInput.ratingInput === Infinity || reviewInput.ratingInput > 10 || (parseFloat(reviewInput.ratingInput) !== parseInt(reviewInput.ratingInput))){throw `${reviewInput.ratingInput} must be integer from 1-10`}
        let cont = validation.checkString(xss(reviewInput.contentInput));
        xss(reviewInput.watchAgainInput);
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
            show.name,
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
    const reviewId = xss(req.params.id.trim());
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
        res.status(400).render('error', {title:"Error", notLoggedIn: false, firstName: req.session.user.firstName, code:400,errorText:'invalid review ID'});
    }
    try {
        let deletedReview = await reviewData.remove(reviewId);
        if (deletedReview !== undefined) {
            return res.redirect('/user/account');
        }
    }
    catch(e) {
        return res.status(500).render('error', {title:"Error", notLoggedIn: false, firstName: req.session.user.firstName, code:500,errorText:e});
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
    let reviewId =xss(req.params.id.trim());
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
    return res.render('editreview', {title: "Edit Review", review:review, notLoggedIn: false, firstName: req.session.user.firstName, error: false});

})
.post(async (req,res) => {
    //update a review
    const reviewId = xss(req.params.id.trim());
    const reviewInput = req.body;
    const userInfo = req.session.user;
    if (!userInfo) {
        //user is not logged in
        return res.redirect('/login');
    }
    //data validation
    let bool = true
    try {
        let rId = validation.checkString(reviewId);
        if (!ObjectId.isValid(rId)) throw 'invalid review id';
        let til = validation.checkString(xss(reviewInput.titleInput));
        if (xss(reviewInput.ratingInput) === undefined || reviewInput.ratingInput === null || !reviewInput.ratingInput){
            throw "The rating is not supplied, null, or undefined";
        }
        if (typeof parseInt(reviewInput.ratingInput) !== 'number') {throw `${reviewInput.ratingInput} is not a number`;}
        if (isNaN(reviewInput.ratingInput)) {throw `${reviewInput.ratingInput} is NaN`;}
        if (reviewInput.ratingInput < 1 || reviewInput.ratingInput === Infinity || reviewInput.ratingInput > 10 || (parseFloat(reviewInput.ratingInput) !== parseInt(reviewInput.ratingInput))){throw `${reviewInput.ratingInput} must be integer from 1-10`}
        let cont = validation.checkString(xss(reviewInput.contentInput));
        xss(reviewInput.watchAgainInput);
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
        res.status(400).render('error', {title:"Error", notLoggedIn: false, firstName: req.session.user.firstName, code:400,errorText:e});
    }
    try {
        //try to update
        const updated = await reviewData.update(
                reviewId,
                reviewInput.titleInput,
                parseInt(reviewInput.ratingInput),
                reviewInput.contentInput,
                bool
            );
        if (updated !== undefined) {
            return res.redirect('/user/account');
        }  
    }
    catch(e) {
        res.status(500).render('error', {title:"Error", notLoggedIn: false, firstName: req.session.user.firstName, code:500,errorText:'review could not be updated'});
    }
});
//get and add/remove upvotes
router
.route('/:showId/:id/addUpvote')
.get(async (req,res) => {
    let revs = undefined;
    let s = [await showData.getShow(xss(req.params.showId))];
    try{
        revs = await showData.getReviewsForShow(s[0]);
    }
    catch(e){
        if (req.session.user){
            return res.status(500).render("error", {title: "Error", notLoggedIn: false, firstName: req.session.user.firstName, code: 500, errorText: e})
        }
        else{
            return res.status(500).render("error", {title: "Error", notLoggedIn: true, code: 500, errorText: e})
        }
    }
    let bool = false;
    if (s[0].averageRating === 0){
        bool = true;
    }
    let simshows = undefined;
    try{
        simshows = await showData.getSimilarShows(s[0]);
    }catch(e){
        if (req.session.user){
            return res.status(500).render("error", {title: "Error", notLoggedIn: false, firstName: req.session.user.firstName, code: 500, errorText: e})
        }
        else{
            return res.status(500).render("error", {title: "Error", notLoggedIn: true, code: 500, errorText: e})
        }
    }
    if (req.session.user) {
        let user = await userData.getUser(req.session.user.emailAddress);
        let reviewId = xss(req.params.id);
        const updateUpvoteForUser = await userData.updateUpvoteForUser(user,reviewId);
        if (updateUpvoteForUser) {
            //upvote added
            let addVote = await reviewData.addUpvote(reviewId);
        }
        else {
            //upvote removed
            let removeVote = await reviewData.removeUpvote(reviewId);
        }
        const showReviews = await showData.getReviewsForShow(s[0]);
        let reviewAlreadyExistsForUser = true;
        for (let i=0; i<showReviews.length; i++) {
            if (showReviews[i].userId === req.session.user._id) {
                //user has already posted a review for this show
                reviewAlreadyExistsForUser = false;
            }
        }
        revs = await showData.getReviewsForShow(s[0]);
        let userSim = await showData.getUserSimiliarShows(req.session.user.emailAddress);
        if (userSim.includes((s[0]._id).toString())) {
            return res.render('individualshow', {title: "Individual Show", notLoggedIn: false,  firstName: req.session.user.firstName, show: s, save: false, check: bool, review: revs, sims: simshows, reviewExists: reviewAlreadyExistsForUser});
        }
        else{
            return res.render('individualshow', {title: "Individual Show", notLoggedIn: false,  firstName: req.session.user.firstName, show: s, save: true, check: bool, review: revs, sims: simshows, reviewExists: reviewAlreadyExistsForUser});
        }
    }
    else {
        return res.render('individualshow', {title: "Individual Show", notLoggedIn: true, save: false, show: s, check: bool, review: revs, sims: simshows});
    } 
})

export default router;