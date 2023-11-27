import {Router} from 'express';
const router = Router();
router.route('').get(async (req, res) => {
    //code here for GET will render the home handlebars file
    return res.render('home', {});
});
export default router;