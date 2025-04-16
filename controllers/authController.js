const User = require('../models/user'); // Mongoose model for User
const Role = require('../models/role');
const Appointment = require('../models/appointment');
const bcrypt = require('bcryptjs');// Import bcryptjs for password hashing
const jwt = require('jsonwebtoken'); // Import jsonwebtoken for generating JWT tokens
const { sendEmailVerificationNotification } = require('../services/emailVerificationService');
const UserResource = require('../resources/UserResource');
const PatientResource = require('../resources/PatientResource');
const PatientCollection = require('../resources/PatientCollection');

exports.signUp = async (req, res) => {
  try {
    const { name, email, password, password_confirmation, birthDate, gender, mobile, email_verified_at, remember_token, photo } = req.body;

    // Step 1: Check if the email already exists
    const existingUserByEmail = await User.findOne({ email });
    if (existingUserByEmail) {
      return res.status(409).json({
        success: 0,
        message: 'Email is already registered!',
      });
    }

    // Step 2: Check if the mobile number already exists
    const existingUserByMobile = await User.findOne({ mobile_no: mobile });
    if (existingUserByMobile) {
      return res.status(409).json({
        success: 0,
        message: 'Mobile number is already registered!',
      });
    }

    // Step 3: Check if passwords match
    if (password !== password_confirmation) {
      return res.status(400).json({
        success: 0,
        message: "Passwords don't match!",
      });
    }

    // Step 4: Create the user
    const newUser = new User({
      name: capitalizeWords(name),
      email,
      dob: birthDate,
      gender,
      mobile_no: mobile,
      password: bcrypt.hashSync(password, 10),
      email_verified_at,
      remember_token,
      photo,
      display: 1,
      inforce: 1,
    });

    const user = await newUser.save();

    // Step 5: Assign the "User" role to the new user
    const userRole = await Role.findOne({ name: 'user' });
    if (userRole) {
      user.roles.push(userRole._id); // Add the role to the user's roles array
      await user.save(); // Save the updated user
    }

    // Step 6: Send email for verification
    await sendEmailVerificationNotification(user, res);

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: 0,
      message: error.message || 'An error occurred while processing your request.',
    });
  }
};

exports.signIn = async (req, res) => {
  try {
    const { email, password, remember } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({
        success: 0,
        message: "Please provide your registered Email-Id and password!"
      });
    }

    // Find user by email
    const isAvailable = await User.findOne({ email }).populate('roles'); // Using Mongoose's findOne() method
        
    if (!isAvailable) {
      return res.status(400).json({
        success: 0,
        message: 'The provided registered email is incorrect!'
      });
    }

    // Check if email is verified
    if (!isAvailable.email_verified_at) {
      return res.status(401).json({
        success: 0,
        message: 'Your E-mail verification is not completed!'
      });
    }

    // Compare the provided password with the hashed password in the database
    const isPasswordValid = await bcrypt.compare(password, isAvailable.password);

    if (!isPasswordValid) {
      return res.status(400).json({
        success: 0,
        message: 'The provided password is incorrect!'
      });
    }

    // Determine token expiration based on "remember me" option
    const tokenExpiresInSecond = remember 
      ? parseDuration(process.env.JWT_EXPIRES_IN_REMEMBER_ME)  // Convert to seconds
      : parseDuration(process.env.JWT_EXPIRES_IN); // Convert to seconds

    

    // Generate JWT token
    const jwtGenerate = jwt.sign(
      {
        id: isAvailable._id, // Use the Mongoose `_id` field
        emailId: isAvailable.email,
      },
      process.env.JWT_SECRET, 
      {
        expiresIn: tokenExpiresInSecond + 60 // 60 seconds extra for buffer time
      }
    );
    // Decode the JWT token to get the expiration time in milliseconds
    const expiresAt = jwt.decode(jwtGenerate).exp * 1000; // Convert to milliseconds
   

    // Optionally, generate Personal Access Token if required
    // await generatePersonalAccessToken(isAvailable, email, tokenExpiresInSecond);

    // Return the response with user data and the JWT token
    return res.status(200).json({
      success: 1,
      message: "You are logged in successfully!",
      userData: new UserResource(isAvailable).toJSON(),
      token: jwtGenerate,
      expiresAt: expiresAt // Send this to the client
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: 0,
      message: error,
    });
  }
};

exports.signOut = async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
  try {
    if(decoded.id) {
      return res.status(201).json({
        success: 1,
        message: "You have logged out successfully!"
      });
    } else {
      return res.status(400).json({
        success: 0,
        message: "No active session found"
      });
    }
  } catch (error) {
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
    const user = await User.findById(verified.id);
    
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

exports.updateUserProfile = async (req, res) => {
  const { name, dob, gender, mobile, aboutMe, remarks } = req.body;

  try {
    // Step 1: Fetch the current user to compare the existing mobile number
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: 0,
        message: 'User not found.',
      });
    }

    // Step 2: Check if the new mobile number is already in use by another user
    if (mobile !== user.mobile_no) {
      const existingUser = await User.findOne({
        mobile_no: mobile,
        _id: { $ne: req.user._id }, // Exclude the current user from the search
      });

      if (existingUser) {
        return res.status(400).json({
          success: 0,
          message: 'The mobile number is already associated with another user.',
        });
      }
    }

    // Step 3: Update the user's profile with conditional logic for mobile number
    const updateData = {
      $set: {
        name: capitalizeWords(name),
        dob,
        gender,
        aboutMe: sentenceCase(aboutMe),
        remarks: sentenceCase(remarks),
      },
    };

    // Push the current mobile number to history only if it has changed
    if (mobile !== user.mobile_no) {
      updateData.$set.mobile_no = mobile;
      updateData.$push = { mobile_nos_previous: user.mobile_no };
    }
    const updatedUser = await User.findOneAndUpdate(
      {_id: req.user._id },
      updateData,
      { new: true }
    ).populate('roles');

    if (!updatedUser) {
      return res.status(404).json({
        success: 0,
        message: 'User not found.',
      });
    }

    // Use UserResource to format the user data
    const userResource = new UserResource(updatedUser);
    return res.status(201).json({
      success: 1,
      message: 'Profile is updated successfully!',
      userData: userResource.toJSON(),
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json({
      success: 0,
      message: 'An error occurred while updating the profile.',
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

  const user = await User.findOne({ _id: req.user._id }).populate('roles');
  res.json({
    success: 1,
    data: new UserResource(user) // Format user details using UserResource    
  });
  
};


exports.getAllMyAppointment = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: 0, message: 'Unauthorized access' });
    }

    const { page = 1, per_page = 10, orderBy = 'desc', sortBy = 'appointmentDate' } = req.query;
    const pageNumber = parseInt(page);
    const itemsPerPage = parseInt(per_page);
    const skip = (pageNumber - 1) * itemsPerPage;

    // Get user info
    const userId = req.user.id;
    const user = await User.findById(userId).populate('roles');

    if (!user) {
      return res.status(404).json({ success: 0, message: 'User not found' });
    }

    const roleNames = user.roles.map(role => role.name);

    let filter = {};

    if (roleNames.includes('doctor')) {
      // Doctor: get only today's appointments assigned to them
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      filter = {
        doctorId: userId,
        appointmentDate: {
          $gte: today,
          $lt: tomorrow,
        },
      };

    } else if (roleNames.includes('patient')) {
      // Patient: get only their own appointments
      filter = { patientId: userId };

    } else if (roleNames.includes('admin')) {
      // Admin: all appointments (optional)
      filter = {};
    } else {
      return res.status(403).json({ success: 0, message: 'Access denied' });
    }

    // Fetch appointments
    const appointments = await Appointment.find(filter)
      .populate('patientId')
      .populate('doctorId')
      .sort({ [sortBy]: orderBy === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(itemsPerPage);

    const total_appointments = await Appointment.countDocuments(filter);
    const total_pages = Math.ceil(total_appointments / itemsPerPage);

    return res.status(200).json({
      success: 1,
      dataAppointments: appointments.map(x => new PatientResource(x).toJSON()),
      total_appointments,
      total_pages,
      current_page: pageNumber,
      itemsPerPage,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: 0,
      message: 'An error occurred while fetching appointments.',
    });
  }
};


exports.userAddressUpdate = async (req, res) => {
  try {
    const { userId, address } = req.body;

    if (!userId || !address || address.length === 0) {
      return res.status(400).json({
        success: 0,
        message: 'userId and address are required.',
      });
    }

    const parsedAddress = address[0];

    const formattedAddress = {};
    Object.keys(parsedAddress).forEach(field => {
      if (field !== 'postalCode') {
        formattedAddress[field] = capitalizeWords(parsedAddress[field]);
      } else {
        formattedAddress[field] = parsedAddress[field]?.trim() || '';
      }
    });

    const user = await User.findOne({ _id: userId });

    if (!user) {
      return res.status(404).json({
        success: 0,
        message: 'User not found',
      });
    }

    if (!user.address) {
      user.address = { current: null, previous: [] };
    }

    const isAddressChanged = JSON.stringify(user.address.current) !== JSON.stringify(formattedAddress);

    if (user.address.current && isAddressChanged) {
      if (Object.keys(user.address.current).length > 0) {
        user.address.previous.push(user.address.current);
      }
    }

    user.address.current = formattedAddress;

    // Ensure previous does not store empty objects
    user.address.previous = user.address.previous.filter(prev => Object.keys(prev).length > 0);

    user.updated_at = new Date();

    const updatedUser = await user.save({ validateModifiedOnly: true });

    return res.status(200).json({
      success: 1,
      message: 'User address updated successfully',
      data: updatedUser,
    });

  } catch (error) {
    res.status(500).json({
      success: 0,
      message: 'Server error',
      error: error.message,
    });
  }
};



const parseDuration = (duration) => {
  const match = duration.match(/^(\d+)([dhms])$/);
  if (!match) throw new Error('Invalid duration format');
  
  const value = parseInt(match[1], 10);
  const unit = match[2];
  
  switch (unit) {
    case 'd': // days
      return value * 24 * 60 * 60 * 1000; // Convert days to milliseconds
    case 'h': // hours
      return value * 60 * 60 * 1000; // Convert hours to milliseconds
    case 'm': // minutes
      return value * 60 * 1000; // Convert minutes to milliseconds
    case 's': // seconds
      return value * 1000; // Convert seconds to milliseconds
    default:
      throw new Error('Unsupported time unit');
  }
};

