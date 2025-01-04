const User = require('../models/user');

exports.signUp = async (req, res) => {
  try { 
    // const {name, email, password, password_confirmation} = req.body;    
    await User.findOne({
      where: {email: req.body.email}
    }).then(async isAvailable =>{      
      if(isAvailable){
        return res.status(400).send({
          success: false,
          message: "Email is already Registered!"
        }); 

      }else{
        if(req.body.password !== req.body.password_confirmation){
          return res.status(400).send({
            success: false,
            message: "Password doesn't matched!"
          });  
    
        }else{
          const registeredData = {
            name: req.body.name, 
            email: req.body.email, 
            dob: req.body.birthDate,
            gender: req.body.gender,
            mobile_no: req.body.mobile,
            password: bcrypt.hashSync(req.body.password,10) //rounds = 15: ~3 sec/hash. The module will use the value you enter and go through 2^rounds hashing iterations.
          };
          await User.create(registeredData).then(async data => {            
            await UserProfile.create({
              user_id: data.dataValues.id,
              display: 1,
              inforce: 1,
            });
            await Profile.create({
              user_id: data.dataValues.id
            });

            const role = await Role.findOne({ where: { label: 'User' } });
            await data.addRole(role);
          
            //Send Email for verification!
            await sendEmailVerificationNotification(data.dataValues, res);
            
          }).catch(err => {
            res.status(500).json({
              success: 0,
              message: err.message || "Some error occurred when you are trying to register"
            });
          });  
          
        }
      }
    }).catch((err)=>{
      res.status(500).json({
        success: 0,
        message: err,
      });
    });
          
  } catch (error) {
    res.status(501).json({
      success: 0,
      message: error,
    });   
  }
      
}
  
exports.signIn = async (req, res) => {
  try {
    const { email, password, device_name, remember } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: 0,
        message: "Please Provide your registered Email-Id and password!"
      })
    }
  
    await User.findOne({ 
      where: { email } 
    }).then(async isAvailable =>{ 
      if(!isAvailable){
        return res.status(400).send({
          success: 0,
          message: 'The provided registered email is incorrect!'
        });
          
      }else{
        if(!isAvailable.email_verified_at){
          res.status(401).json({
            success: false,
            message: 'Your E-mail verification is not Completed!'
          })
        }else{
          const isPasswordValid = await bcrypt.compare(password, isAvailable.password);
          if(!isPasswordValid){
            return res.status(400).send({
              success: 0,
              message: 'The provided password credentials is incorrect!'
            });
          }else{       
            // Determine token expiration based on "remember me" option
            const tokenExpiresInSecond = remember 
            ? parseDuration(process.env.JWT_EXPIRES_IN_REMEMBER_ME)  // Convert to seconds
            : parseDuration(process.env.JWT_EXPIRES_IN); // Convert to seconds

            // Log the parsed duration
            console.log('Parsed tokenExpiresIn in seconds:', tokenExpiresInSecond);

            // Generate JWT token
            const jwtGenerate = jwt.sign({
              id: isAvailable.id, 
              emailId: isAvailable.email
            }, 
              process.env.JWT_SECRET, 
            {
              expiresIn: tokenExpiresInSecond + 60 //60s extra for bufferime 
            });
            
            // Also return the expiration time to the client
            const expiresAt = jwt.decode(jwtGenerate).exp * 1000; // Convert to milliseconds
                    
            // Log the decoded expiration timestamp
            console.log('JWT decoded exp in ms:', expiresAt);    

            // Generate Personal Access Token
            await generatePersonalAccessToken(isAvailable, device_name, tokenExpiresInSecond);

            return res.status(201).json({
              success: 1,
              message: "You are logged in successfully!",
              userData: new UserResource(isAvailable).toJSON(),
              token: jwtGenerate,
              expiresAt: expiresAt // Send this to the client
            });
          }
        }
      }
    })

  } catch (error) {
    res.status(400).send(error);
  }
};

exports.signOut = async (req, res) => {
  try {
    if (req.paToken) {
      await req.paToken.destroy();
      return res.status(201).json({
        success: 1,
        message: "You have logged out successfully"
      });
    } else {
      return res.status(400).json({
        success: 0,
        message: "No active session found"
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: 0,
      message: "An error occurred. Please try again later."
    });
  }
};

exports.verifyEmail = async (req, res) => {
  const { token } = req.params;
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(verified.id);
    
    if (!user) {
      return res.status(404).json({
        success: 0,  
        message: "Unauthorized Access!" 
      });
    }

    if (user.email_verified_at) {
      return res.status(201).json({  
        success: 0, 
        message: "Registered E-mail already verified! You can Login Now"
      });
    }

    user.email_verified_at = new Date();
    await user.save();

    res.status(200).json({
      success: 1, 
      message: 'Your account is activated. You can login now' 
    });
  } catch (error) {
    res.status(400).json({ 
      success: 0, 
      error: 'Invalid or expired token' 
    });
  }
};

exports.getAuthUserDetails = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: 0,
      message: "Unauthorized - No user information available"
    });
  }
  // const user = await User.findByPk(req.user.id);
  const user = await User.findByPk(req.user.id, {
    include: [
      {
        model: Role,
      },
      {
        model: Profile
      }
    ],    
  });
  
  res.json({
    success: 1,
    data: new UserResource(user) // Format user details using UserResource    
  });
};