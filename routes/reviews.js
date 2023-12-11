import {Router} from 'express';
const router = Router();
import {reviewData} from '../data/index.js';
import * as validation from '../validation.js';
export default router;

//create a new review
router
.route('/')
.post(async (req, res) => {
    //req.params.id is review id
    const userInfo = req.session.user;
    const reviewInput = req.body;
    if (!reviewInput || Object.keys(reviewInput).length === 0) {
        return res
            .status(400)
            .json({error: 'There are no fields in the request body'});
    }
    if (!userInfo) {
        //user is not logged in
        return res
            .status(401)
            .json({error: 'User is not logged in'});
    }

    try {
        //Data Validation
        let sId = validation.checkString(reviewInput.show_id);
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
        return res
            .status(400)
            .json({error: e});
    }
    try {
        //Insert the review
        const newReview = await reviewData.create(
            reviewInput.show_id,
            req.session.user._id,
            req.session.user.firstName,
            req.session.user.lastName,
            reviewInput.title,
            reviewInput.rating,
            reviewInput.content,
            reviewInput.watchAgain
        );
        return res
            .status(200)
            .json(newReview);
    }
    catch(e) {
        return res
            .status(500)
            .json({error: e});
    }
});

router
.route('/:id')
.delete(async (req,res) => {
    //remove a review
    //req.params.id is review id
    const reviewId = req.params.id.trim();
    //data validation
    try {
        let rId = validation.checkString(reviewId);
        if (!ObjectId.isValid(rId)) throw 'invalid show ID';
    }
    catch(e) {
        return res
            .status(400)
            .json(e);
    }
    try {
        let deletedReview = await reviewData.remove(reviewId);
        return res
            .status(200)
            .json(deletedReview);
    }
    catch(e) {
        return res
            .status(404)
            .json({error: e});
    }
})
.put(async (req,res) => {

});