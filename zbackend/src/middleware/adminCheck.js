module.exports = function(req, res, next) {
    if (req.isAuthenticated() && req.user.emailid==="donkingk12345@gmail.com") {
      return next();
    } else {
      req.session.errorMessage = 'Access denied. Admins only.';
      res.redirect('/dashboard');
    }
}
  