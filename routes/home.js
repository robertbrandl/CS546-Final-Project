import {Router} from 'express';
const router = Router();
router.route('').get(async (req, res) => {
    //code here for GET will render the home handlebars file
    if (req.session.user){
        return res.render('home', {title: "Home Page", notLoggedIn: false, firstName: req.session.user.firstName});
    }
    else{
        return res.render('home', {title: "Home Page", notLoggedIn: true});
    }
});
export default router;