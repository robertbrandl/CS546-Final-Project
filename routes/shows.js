import {Router} from 'express';
const router = Router();
import {showData} from '../data/index.js';
import * as validation from '../validation.js';
router.route('/searchresults').get(async (req, res) => {
    //code here for GET will render the page with all TV Shows
    let body = req.query.searchTerm;
    let term = "";
    try{
        term = validation.checkString(body);
      }catch(e){
        if (req.session.user){
            return res.status(400).render('error', {title: "Error", notLoggedIn: false, firstName: req.session.user.firstName, code: 400, errorText: "Search Term cannot be empty and must be a valid string"});
        }
        else{
            return res.status(400).render('error', {title: "Error", notLoggedIn: true, code: 400, errorText: "Search Term cannot be empty and must be a valid string"});
        }
      }
    try{
        let s = await showData.searchForShow(term);
        if (req.session.user){
            return res.render('allshows', {title: "Search Results", notLoggedIn: false, firstName: req.session.user.firstName, shows: s});
        }
        else{
            return res.render('allshows', {title: "Search Results", notLoggedIn: true, shows: s});
        }
    }catch{
        if (req.session.user){
            return res.render('allshows', {title: "Search Results", notLoggedIn: false, firstName: req.session.user.firstName, shows: []});
        }
        else{
            return res.render('allshows', {title: "Search Results", notLoggedIn: true, shows: []});
        }
    }
});
router.route('/findmenu').get(async (req, res) => {//Don't Know What to Watch? Menu Route
    //code here for GET will render the Don't Know What to Watch? Menu
    return res.render('findmenu', {title: "Don't Know What to Watch?"});
});
router.route('/findmenu').post(async (req, res) => {//Don't Know What to Watch? Menu Route
    //code here for POST 
    //same like the data function, do all error checking
    //when finished, run the data function, make sure no errors
    //render the output page called menuresults
});
router.route('/').get(async (req, res) => {
    //code here for GET will render the page with all TV Shows
    let s = undefined;
    try{
        s = await showData.getAllShows();
    }catch(e){
        let codenum = parseInt(e.substring(0,3));
        if (req.session.user){
            return res.status(codenum).render("error", {title: "Error", notLoggedIn: false, firstName: req.session.user.firstName, code: codenum, errorText: e.substring(3)})
        }
        else{
            return res.status(codenum).render("error", {title: "Error", notLoggedIn: true, code: codenum, errorText: e.substring(3)})
        }
    }
    if (req.session.user){
        return res.render('allshows', {title: "TV Show List", notLoggedIn: false, firstName: req.session.user.firstName, shows: s});
    }
    else{
        return res.render('allshows', {title: "TV Show List", notLoggedIn: true, shows: s});
    }
});
router.route('/:id').get(async (req, res) => {
    //code here for GET will render the individual TV Show page
    let id = req.params.id;
    try{
        id = validation.checkString(id);
        let numId = parseInt(id);
        if (typeof numId !== "number" || isNaN(numId) || numId === Infinity) {}
    }catch(e){
        if (req.session.user){
            return res.status(400).render("error", {title: "Error", notLoggedIn: false, firstName: req.session.user.firstName, code: 400, errorText: "Show apiId is not valid or not a number"})
        }
        else{
            return res.status(400).render("error", {title: "Error", notLoggedIn: true, code: 400, errorText: "Show apiId is not valid or not a number"})
        }
    }
    let s = undefined;
    try{
        s = [await showData.getIndividualShow(id)];
    }catch(e){
        let codenum = parseInt(e.substring(0,3));
        if (req.session.user){
            return res.status(codenum).render("error", {title: "Error", notLoggedIn: false, firstName: req.session.user.firstName, code: codenum, errorText: e.substring(3)});
        }
        else{
            return res.status(codenum).render("error", {title: "Error", notLoggedIn: true, code: codenum, errorText: e.substring(3)});
        }
    }
    let bool = false;
    if (s[0].averageRating === 0){
        bool = true;
    }
    let revs = undefined;
    try{
        revs = await showData.getReviewsForShow(s[0]);
    }catch(e){
        if (req.session.user){
            return res.status(500).render("error", {title: "Error", notLoggedIn: false, firstName: req.session.user.firstName, code: 500, errorText: e})
        }
        else{
            return res.status(500).render("error", {title: "Error", notLoggedIn: true, code: 500, errorText: e})
        }
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
    if (req.session.user){
        let userSim = await showData.getUserSimiliarShows(req.session.user.emailAddress);
        if (userSim.includes((s[0]._id).toString())) {
            return res.render('individualshow', {title: "Individual Show", notLoggedIn: false,  firstName: req.session.user.firstName, show: s, save: false, check: bool, review: revs, sims: simshows});
        }
        else{
            return res.render('individualshow', {title: "Individual Show", notLoggedIn: false,  firstName: req.session.user.firstName, show: s, save: true, check: bool, review: revs, sims: simshows});
        }
    }
    else{
        return res.render('individualshow', {title: "Individual Show", notLoggedIn: true, save: false, show: s, check: bool, review: revs, sims: simshows});
    }
});


export default router;