import {Router} from 'express';
const router = Router();
import {showData} from '../data/index.js';
import * as validation from '../validation.js';
router.route('/').get(async (req, res) => {
    //code here for GET will render the page with all TV Shows
    let s = await showData.getAllShows();
    return res.render('allshows', {title: "TV Show List", shows: s});
});
router.route('/:id').get(async (req, res) => {
    //code here for GET will render the individual TV Show page
});

export default router;