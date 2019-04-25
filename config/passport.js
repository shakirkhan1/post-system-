const LocalStrategy    = require('passport-local').Strategy,
	  mongoose         = require("mongoose"),
	  bcrypt           = require("bcryptjs");

// load user model
const User = require('../models/User'); 

module.exports = (passport)=>{
	passport.use(
		new LocalStrategy({ 
			              usernameField : 'username'
			                 }, (username, password, done)=>{
						// match user
						User.findOne({'username':username}).then(user => {
							if(!user)
							{
								return done(null, false, { message: 'The username is not registered'});
							}

							// match password
							bcrypt.compare(password, user.password, (err, isMatch)=>{
								if(err) console.log(err);

								if(isMatch){
									return done(null, user);
								}
								else{
									return done(null, false,  { message: 'Password is incorrect'});
								}
							});
						 })
						.catch(err => console.log(err));
					})
			);
passport.serializeUser((user, done)=>{
  done(null, user.id);
});

passport.deserializeUser((id, done)=>{
  User.findById(id, (err, user)=> {
    done(err, user);
  });
}); 

}