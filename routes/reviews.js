import {Router} from 'express';
const router = Router();
import {reviewData} from '../data/index.js';
import {showData} from '../data/shows.js';
import * as validation from '../validation.js';


//create a new review
router
.route('/:id/createreview')
.get(async (req, res) => {
    const userInfo = req.session.user;
    if (!userInfo) {
        //user is not logged in
        res.redirect('/login');
    }
    const showId = req.params.id.trim();
    const show = await showData.getIndividualShow(showId);
    showTitle = show.name;

    res.render('createreview', {title: "Create a review for "+showTitle, firstName: req.session.user.firstName, 
    lastName: req.session.user.lastName, show_id: showId});
})
.post(async (req, res) => {
    const userInfo = req.session.user;
    if (!userInfo) {
        //user is not logged in
        res.redirect('/login');
    }
    const showId = req.params.id.trim();
    const show = await showData.getIndividualShow(showId);
    showTitle = show.name;
    const reviewInput = req.body;
    try {
        //Data Validation
        let sId = validation.checkString(showId);
        if (!ObjectId.isValid(sId)) throw 'invalid show ID';
        let uId = validation.checkString(req.session.user._id);
        if (!ObjectId.isValid(uId)) throw 'invalid user ID';
        let fname = validation.checkString(req.session.user.firstName);
        let lname = validation.checkString(req.session.user.lastName);
        let til = validation.checkString(reviewInput.title);
        if (reviewInput.rating === undefined || reviewInput.rating === null || !reviewInput.rating){
            throw "The rating is not supplied, null, or undefined";
        }
        if (typeof reviewInput.rating !== 'number') {throw `${reviewInput.rating} is not a number`;}
        if (isNaN(reviewInput.rating)) {throw `${reviewInput.rating} is NaN`;}
        if (reviewInput.rating < 1 || reviewInput.rating === Infinity || reviewInput.rating > 10 || (parseFloat(reviewInput.rating) !== parseInt(reviewInput.rating))){throw 'MaxCap is not valid'}
        let cont = validation.checkString(reviewInput.content);
        if (reviewInput.watchAgain === undefined || reviewInput.watchAgain === null){throw "watchAgain is null or undefined"}
        if (typeof reviewInput.watchAgain !== "boolean"){throw "watchAgain is not a boolean"}
    }
    catch(e) {
        res.render('createreview', {title: "Create a review for "+showTitle, firstName: req.session.user.firstName, 
        lastName: req.session.user.lastName, show_id: showId, error: e});
    }
    try {
        //Insert the review
        const newReview = await reviewData.create(
            showId,
            req.session.user._id,
            req.session.user.firstName,
            req.session.user.lastName,
            reviewInput.title,
            reviewInput.rating,
            reviewInput.content,
            reviewInput.watchAgain
        );
        if (newReview !== undefined) {
        //if successful, redirect to individual show page
            res.redirect('/shows/'+showId);
        }
    }
    catch(e) {
        //could not create review
        res.render('createreview', {title: "Create a review for "+showTitle, firstName: req.session.user.firstName, 
        lastName: req.session.user.lastName, show_id: showId, error: e});
    }
});

router
.route('/account/:id')
.delete(async (req,res) => {
    //remove a review
    //req.params.id is review id
    const reviewId = req.params.id.trim();
    const userInfo = req.session.user;
    if (!userInfo) {
        //user is not logged in
        res.redirect('/login');
    }
    //data validation
    try {
        let rId = validation.checkString(reviewId);
        if (!ObjectId.isValid(rId)) throw 'invalid review ID';
    }
    catch(e) {
        res.redirect('error', {code:'400',errorText:'invalid review ID'});
    }
    try {
        let deletedReview = await reviewData.remove(reviewId);
        if (deletedReview !== undefined) {
            return res.redirect('/account');
        }
    }
    catch(e) {
        res.redirect('error', {code:'404',errorText:'review could not be deleted'});
    }
})
.put(async (req,res) => {
    //update a review
    const reviewId = req.params.id.trim();
    const reviewInput = req.body;
    const userInfo = req.session.user;
    if (!userInfo) {
        //user is not logged in
        res.redirect('/login');
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
        if (reviewInput.rating < 1 || reviewInput.rating === Infinity || reviewInput.rating > 10 || (parseFloat(reviewInput.rating) !== parseInt(reviewInput.rating))){throw 'MaxCap is not valid'}
        let cont = validation.checkString(reviewInput.content);
        if (reviewInput.watchAgain === undefined || reviewInput.watchAgain === null){throw "watchAgain is null or undefined"}
        if (typeof reviewInput.watchAgain !== "boolean"){throw "watchAgain is not a boolean"}
    }
    catch(e) {
        res.render('error',{code:'400',errorText:e});
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
            return res.redirect('/account');
        }  
    }
    catch(e) {
        res.redirect('error', {code:'404',errorText:'review could not be deleted'});
    }
});

export default router;