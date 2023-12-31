import {Router} from 'express';
const router = Router();
import {showData} from '../data/index.js';
import * as validation from '../validation.js';
import xss from 'xss';
var shows = [];
router.route('/searchresults').get(async (req, res) => {
    //code here for GET will render the page with all TV Shows
    let body = xss(req.query.searchTerm);
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
        shows = s;
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
router.route('/findMenu').get(async (req, res) => {//Don't Know What to Watch? Menu Route
    //code here for GET will render the Don't Know What to Watch? Menu
    if (req.session.user){
        return res.render('findmenu', {title: "Don't Know What to Watch?", notLoggedIn: false, firstName: req.session.user.firstName});
    }
    else{
        return res.render('findmenu', {title: "Don't Know What to Watch?", notLoggedIn: true});
    }
});
router.route('/findMenu').post(async (req, res) => {
    try {
        let {genre, maxRuntime, minAverageRating} = req.body;
        genre = validation.checkString(xss(genre));
        maxRuntime = Number(xss(maxRuntime));
        minAverageRating = Number(xss(minAverageRating));

        if (isNaN(maxRuntime) || maxRuntime === Infinity || maxRuntime < 1 || maxRuntime > 1000) {
            throw 'Please enter a valid number for maximum runtime between 1 and 1000';
        } 
        if (isNaN(minAverageRating) || minAverageRating === Infinity || minAverageRating < 0 || minAverageRating > 10) {
            throw 'Please enter a valid rating between 0 and 10' ;
        }

        let matchingShows = await showData.findMenu(genre, maxRuntime, minAverageRating);
        if (matchingShows.length < 1) {
            if (req.session.user){
                return res.render('menuresults', {title: "Search Results", notLoggedIn: false, firstName: req.session.user.firstName, shows: matchingShows,noShows:true});
            }
            else{
                return res.render('menuresults', {title: "Search Results", notLoggedIn: true, shows: matchingShows, noShows:true});
            }
        }
        else {
            if (req.session.user){
                return res.render('menuresults', {title: "Search Results", notLoggedIn: false, firstName: req.session.user.firstName, shows: matchingShows,noShows:false});
            }
            else{
                return res.render('menuresults', {title: "Search Results", notLoggedIn: true, shows: matchingShows,noShows:false});
            }
        }
    } catch (error) {
        if (req.session.user){
            return res.render('findMenu', {title: "Find Menu", notLoggedIn: false, firstName: req.session.user.firstName, error: error});
        }
        else{
            return res.render('findMenu', {title: "Find Menu", notLoggedIn: true, error: error});
        }
    }
});
router.route('/filter').get(async (req, res) => {
    //code here for GET will render the page with all TV Shows with the inputted genre
    let body = xss(req.query.filterGenre);
    let genre = "";
    try{
        genre = validation.checkString(body);
      }catch(e){
        if (req.session.user){
            return res.status(400).render('error', {title: "Error", notLoggedIn: false, firstName: req.session.user.firstName, code: 400, errorText: "Genre Search Term cannot be empty and must be a valid string"});
        }
        else{
            return res.status(400).render('error', {title: "Error", notLoggedIn: true, code: 400, errorText: "Genre Search Term cannot be empty and must be a valid string"});
        }
      }
    let allgenres = ['Comedy', 'History', 'Sports', 'Horror', 'Adventure', 'Crime', 'Supernatural', 'Action', 'Anime', 'Science-Fiction', 'Drama', 'Legal', 'Thriller', 'Fantasy', 'Family', 'War', 'Medical', 'Espionage', 'Romance', 'Music', 'Western', 'Mystery'];
    allgenres = allgenres.map(element => element.toLowerCase());
    if (!allgenres.includes(genre.toLowerCase())){
        if (req.session.user){
            return res.status(400).render('error', {title: "Error", notLoggedIn: false, firstName: req.session.user.firstName, code: 400, errorText: "Genre name is not valid"});
        }
        else{
            return res.status(400).render('error', {title: "Error", notLoggedIn: true, code: 400, errorText: "Genre name is not valid"});
        }
    }
    try{
        let s = await showData.filterByGenre(genre, shows);
        if (req.session.user){
            return res.render('allshows', {title: "Filterd TV Shows", notLoggedIn: false, firstName: req.session.user.firstName, shows: s});
        }
        else{
            return res.render('allshows', {title: "Filtered TV Shows", notLoggedIn: true, shows: s});
        }
    }catch{
        if (req.session.user){
            return res.render('allshows', {title: "Filtered TV Shows", notLoggedIn: false, firstName: req.session.user.firstName, shows: []});
        }
        else{
            return res.render('allshows', {title: "Filtered TV Shows", notLoggedIn: true, shows: []});
        }
    }
});
router.route('/sort').get(async (req, res) => {
    //code here for GET will render the page with all TV Shows with the selected feature
    let body = xss(req.query.sortFeature);
    let order = xss(req.query.sortOrder)
    let feature = "";
    try{
        feature = validation.checkString(body);
    }catch(e){
        if (req.session.user){
            return res.status(400).render('error', {title: "Error", notLoggedIn: false, firstName: req.session.user.firstName, code: 400, errorText: "Feature cannot be empty and must be a valid string"});
        }
        else{
            return res.status(400).render('error', {title: "Error", notLoggedIn: true, code: 400, errorText: "Feature cannot be empty and must be a valid string"});
        }
    }
    try{
        order = validation.checkString(order);
    }catch(e){
        if (req.session.user){
            return res.status(400).render('error', {title: "Error", notLoggedIn: false, firstName: req.session.user.firstName, code: 400, errorText: "Order cannot be empty and must be a valid string"});
        }
        else{
            return res.status(400).render('error', {title: "Error", notLoggedIn: true, code: 400, errorText: "Order cannot be empty and must be a valid string"});
        }
    }
    let allfeatures = ['runtime', 'rating', 'rewatch'];
    if (!allfeatures.includes(feature.toLowerCase())){
          if (req.session.user){
              return res.status(400).render('error', {title: "Error", notLoggedIn: false, firstName: req.session.user.firstName, code: 400, errorText: "Sort feature is not valid"});
          }
          else{
              return res.status(400).render('error', {title: "Error", notLoggedIn: true, code: 400, errorText: "Sort feature is not valid"});
          }
    }
    let allorders = ['ascending', 'descending'];
    if (!allorders.includes(order.toLowerCase())){
        if (req.session.user){
            return res.status(400).render('error', {title: "Error", notLoggedIn: false, firstName: req.session.user.firstName, code: 400, errorText: "Sort order is not valid"});
        }
        else{
            return res.status(400).render('error', {title: "Error", notLoggedIn: true, code: 400, errorText: "Sort order is not valid"});
        }
    }
    try{
        let s = await showData.sortByFeature(feature, order, shows);
        if (req.session.user){
            return res.render('allshows', {title: "Sorted TV Shows", notLoggedIn: false, firstName: req.session.user.firstName, shows: s});
        }
        else{
            return res.render('allshows', {title: "Sorted TV Shows", notLoggedIn: true, shows: s});
        }
    }catch{
        if (req.session.user){
            return res.render('allshows', {title: "Sorted TV Shows", notLoggedIn: false, firstName: req.session.user.firstName, shows: []});
        }
        else{
            return res.render('allshows', {title: "Sorted TV Shows", notLoggedIn: true, shows: []});
        }
    }
});
router.route('/').get(async (req, res) => {
    //code here for GET will render the page with all TV Shows
    let s = undefined;
    try{
        s = await showData.getAllShows();
        shows = s
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
    let id = xss(req.params.id);
    try{
        id = validation.checkString(id);
        let numId = parseInt(id);
        if (typeof numId !== "number" || isNaN(numId) || numId === Infinity) {
            throw `Show apiId is not valid or not a number`
        }
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
    //check if user has posted a review for this show already

    if (req.session.user){
        const showReviews = await showData.getReviewsForShow(s[0]);
        let reviewAlreadyExistsForUser = true;
        for (let i=0; i<showReviews.length; i++) {
            if (showReviews[i].userId === req.session.user._id) {
                //user has already posted a review for this show
                reviewAlreadyExistsForUser = false;
            }
        }
        
        let userSim = await showData.getUserSimiliarShows(req.session.user.emailAddress);
        if (userSim.includes((s[0]._id).toString())) {
            return res.render('individualshow', {title: "Individual Show", notLoggedIn: false,  firstName: req.session.user.firstName, show: s, save: false, check: bool, review: revs, sims: simshows, reviewExists: reviewAlreadyExistsForUser});
        }
        else{
            return res.render('individualshow', {title: "Individual Show", notLoggedIn: false,  firstName: req.session.user.firstName, show: s, save: true, check: bool, review: revs, sims: simshows, reviewExists: reviewAlreadyExistsForUser});
        }

    }
    else{
        return res.render('individualshow', {title: "Individual Show", notLoggedIn: true, save: false, show: s, check: bool, review: revs, sims: simshows});
    }
});
router.route('/:id/sort').get(async (req, res) => {
    //code here for GET will render the individual TV Show page
    let id = xss(req.params.id);
    let feature = xss(req.query.reviewFeature);
    let allfeatures = ['rating', 'upvotes'];
    if (!allfeatures.includes(feature.toLowerCase())){
        if (req.session.user){
            return res.status(400).render('error', {title: "Error", notLoggedIn: false, firstName: req.session.user.firstName, code: 400, errorText: "Sort feature is not valid"});
        }
        else{
            return res.status(400).render('error', {title: "Error", notLoggedIn: true, code: 400, errorText: "Sort feature is not valid"});
        }
    }
    try{
        id = validation.checkString(id);
        let numId = parseInt(id);
        if (typeof numId !== "number" || isNaN(numId) || numId === Infinity) {
            throw `Show apiId is not valid or not a number`
        }
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
        revs = showData.sortReviews(revs, feature)
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
    //check if user has posted a review for this show already

    if (req.session.user){
        const showReviews = await showData.getReviewsForShow(s[0]);
        let reviewAlreadyExistsForUser = true;
        for (let i=0; i<showReviews.length; i++) {
            if (showReviews[i].userId === req.session.user._id) {
                //user has already posted a review for this show
                reviewAlreadyExistsForUser = false;
            }
        }
        
        let userSim = await showData.getUserSimiliarShows(req.session.user.emailAddress);
        if (userSim.includes((s[0]._id).toString())) {
            return res.render('individualshow', {title: "Individual Show", notLoggedIn: false,  firstName: req.session.user.firstName, show: s, save: false, check: bool, review: revs, sims: simshows, reviewExists: reviewAlreadyExistsForUser});
        }
        else{
            return res.render('individualshow', {title: "Individual Show", notLoggedIn: false,  firstName: req.session.user.firstName, show: s, save: true, check: bool, review: revs, sims: simshows, reviewExists: reviewAlreadyExistsForUser});
        }

    }
    else{
        return res.render('individualshow', {title: "Individual Show", notLoggedIn: true, save: false, show: s, check: bool, review: revs, sims: simshows});
    }
});



export default router;