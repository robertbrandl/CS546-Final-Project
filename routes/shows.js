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
        return res.status(400)//.render('login', {title: "Login", error: true, msg: "Error: Email is not valid"});
      }
    let s = await showData.searchForShow(term);
    return res.render('allshows', {title: "Search Results", shows: s});
});
router.route('/').get(async (req, res) => {
    //code here for GET will render the page with all TV Shows
    let s = await showData.getAllShows();
    return res.render('allshows', {title: "TV Show List", shows: s});
});
router.route('/:id').get(async (req, res) => {
    //code here for GET will render the individual TV Show page
    let id = req.params.id;
    try{
        id = validation.checkString(id);
    }catch(e){
        return res.status(400)//.render("error", {title: "Error", status: 400, message: "Search id is not valid"})
    }
    let s = [await showData.getIndividualShow(id)];
    let bool = false;
    if (s[0].averageRating === 0){
        bool = true;
    }
    return res.render('individualshow', {title: "Individual Show", show: s, check: bool});
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


export default router;