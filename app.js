const   express          = require("express"),
		expressSanitizer = require("express-sanitizer"),
	    bodyParser       = require("body-parser"),
	    mongoose         = require("mongoose"),
	    bcrypt           = require("bcryptjs"),
	    flash            = require("connect-flash"),
	    session          = require("express-session"),
	    passport         = require("passport"),
		User             = require("./models/User"),
		Post             = require("./models/Post"),
		Like             = require("./models/Like"),
		//uri              = require('./config/keys').mongoURI,
	    app              = express();

const indexRoutes       = require("./routes/index");

const {ensureAuthenticated } = require('./config/auth');
  
// passport config 
require('./config/passport')(passport);

const uri = process.env.DATABASEURL || "mongodb://localhost/postproject" ;
// creating database dynamically
mongoose.connect(uri,{ useNewUrlParser: true }, () => {
	console.log('connected to mongodb');
});

app.use(express.urlencoded({extended: false})); 
app.use(express.static("public"));
app.use(express.static("config"));
app.use(express.static("views"));
app.use(expressSanitizer());
app.set("view engine","ejs");

// express session
app.use(session({
	secret            : 'secret',
	resave            : true,
	saveUninitialized : true
}));

// passport middleware
app.use(passport.initialize());
app.use(passport.session());

// connect flash
app.use(flash());

// global vars
app.use((req, res, next)=>{
	res.locals.success_msg = req.flash('success_msg');
	res.locals.error_msg   = req.flash('error_msg');
	res.locals.error       = req.flash('error');
	next(); 
});
// ===> ALL GET RESQUESTs =================================
app.use("/",indexRoutes);

app.get("/post/:name",(req,res)=>{
	//console.log(req.params.name);
	User.findOne({username:req.params.name},(err, info)=>{
		 if(err){
           console.log(err);
       }else{
           // console.log(info._id);
			res.render("post",{id: info._id});
       }	
	});
});
//====================================================
app.post("/post/:id", (req, res) => {
	
	const {title, postbody } = req.body; // object de-structuring
	let errors= [] ;
	const post_id = req.params.id;
	//consoe.log(post_id);
	// check required fields
	if(!title || !postbody )
	{
		errors.push({msg: 'please fill in all fields'});
	}
    // any issue
    if(errors.length >0 )
    {
    	res.render("post",{
	    		errors,
	    		title, 
	    		postbody,
	    		id:post_id
    	});
    }
    else
    {
    	User.findById(post_id,(err, info)=>{
							 if(err){
					           console.log(err);
					       }else{
					             // console.log(info.fullname);
								  var newpost = {
											     	title: title,
											     	postbody: postbody,
											     	author:{
												     		id: info._id,
												     		username: info.username
										     			}
		     									};
		     									// console.log(newpost);
		     									 //res.send(newpost);
		     									 Post.create(newpost, function(err, postinfo){
											        if(err)
											        {
											            res.render("new");
											        }
											        else{
											        	//console.log(postinfo);
											            res.redirect("/home");
											        }
											    });
											    
					      		   }
		
					});
	}
  });

app.post("/like/:post_id",(req, res)=>{
	//console.log(req.user.username);
	//res.send(req.params.post_id +" "+ req.user.username);
	Like.findOne({$and: [{bywhom:req.user.username},{post_id:req.params.post_id}] },(err, info)=>{
		if(info)// already user liked the post
		{
			if(info.totalcount >0 )
			{
				Like.findByIdAndUpdate(info._id,{
                                $inc: {
                                    totalcount: -1
                                }
                            },{new: true },(err, newinfo)=>{
                            	//res.send(newinfo);
                            	res.redirect("/home");
                            });
			}
			else{
				Like.findByIdAndUpdate(info._id,{
                                $inc: {
                                    totalcount: +1
                                }
                            },{new: true },(err, info1)=>{
                            	//res.send(info);
                            	res.redirect("/home");
                            });
			}
		//	res.send("already liked " + info.bywhom+" "+info.post_id);
		}
		else // first time liking the post
		{
			var newlike = {
						post_id: req.params.post_id,
						bywhom : req.user.username
			};
			Like.create(newlike,(err, likeinfo)=>{
				if(err)
					{console.log(err);}
				else{
					Like.findByIdAndUpdate(likeinfo._id,{
                                $inc: {
                                    totalcount: +1
                                }
                            },{new: true },(err, info)=>{
                            	//res.send(info);
                            	res.redirect("/home");
                            });
				}
			});
			//res.send(info.bywhom);
		}
	});
});


//=====================================================
const PORT = process.env.PORT || 3000 ;


app.listen(PORT, () =>{
    console.log(`Server Started .. listening at port: ${PORT}`);
});
 