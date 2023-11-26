import {Router} from 'express';
const router = Router();
import * as shows from '../data/shows.js';;
import * as validation from '../validation.js';
router.route('/').get(async (req, res) => {
    //code here for GET will render the home handlebars file
    return res.render('home', {title: "TV Show Recommender"});
});

export default router;