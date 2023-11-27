import reviewRoutes from "./reviews.js";
import showRoutes from "./shows.js";
import userRoutes from "./users.js";
import homeRoute from "./home.js"
const constructorMethod = (app) => {
    app.use('/', homeRoute);
    app.use('/shows', showRoutes);
    app.use('/user', userRoutes);
    app.use('/reviews', reviewRoutes);
    app.use('*', (req, res) => {
        res.redirect('/');
      });
}
export default constructorMethod;