const User = require('../models/user'); // Mongoose model for User
const UserProfile = require('../models/userProfile'); // Mongoose model for UserProfile
const Role = require('../models/role'); // Mongoose model for Role
const bcrypt = require('bcrypt');// Import bcryptjs for password hashing
const { sendEmailVerificationNotification } = require('../services/emailVerificationService');

exports.signUp = async (req, res) => {
  try {
    const { name, email, password, password_confirmation, birthDate, gender, mobile } = req.body;

    // Check if the email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(200).json({
        success: false,
        message: 'Email is already registered!',
      });
    }

    // Check if passwords match
    if (password !== password_confirmation) {
      return res.status(200).json({
        success: false,
        message: "Passwords don't match!",
      });
    }

    // Create the user
    const hashedPassword = bcrypt.hashSync(password, 10);
    const newUser = new User({
      name,
      email,
      dob: birthDate,
      gender,
      mobile_no: mobile,
      password: hashedPassword,
    });
    const user = await newUser.save(); // Save the user and assign it to `user`

    // Create a user profile
    const userProfile = new UserProfile({
      user_id: user._id, // Use `user._id` from the saved user
      display: 1,
      inforce: 1,
    });
    await userProfile.save();

    // Assign the "User" role to the new user
    const userRole = await Role.findOne({ label: 'User' });
    if (userRole) {
      user.roles.push(userRole._id); // Add the role to the user's roles array
      await user.save(); // Save the updated user
    }

    // Send email for verification
    await sendEmailVerificationNotification(user, res);

    return res.status(201).json({
      success: true,
      message: 'User registered successfully! Verification email sent.',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message || 'An error occurred while processing your request.',
    });
  }
};

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
        return res.status(200).send({
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