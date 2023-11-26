import reviewRoutes from "./reviews.js";
import showRoutes from "./shows.js";
import userRoutes from "./users.js";
const constructorMethod = (app) => {
    app.use('/home', showRoutes);
    app.use('/shows', showRoutes);
    app.use('/user', userRoutes);
    app.use('/reviews', reviewRoutes);
    app.use('*', (req, res) => {
        res.redirect('/home');
      });
}
export default constructorMethod;