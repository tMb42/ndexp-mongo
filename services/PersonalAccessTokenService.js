const crypto = require('crypto');
const { PersonalAccessToken } = require('../models'); 

const generatePersonalAccessToken = async (user, email, tokenExpiresInSecond) => {
  const tokenValue = crypto.randomBytes(32).toString('hex'); // Generates a 64-character string compatible with Larave-Sactum. If required 128 charecter then use 64 in place of 
  const expiresAt = new Date();
 
//  const expiresInSeconds = Math.floor(tokenExpiresInSecond); // Convert ms to minutes
expiresAt.setSeconds(expiresAt.getSeconds() + tokenExpiresInSecond); // Set the expiration dates
console.log('expiresAt2',expiresAt)
    
  await PersonalAccessToken.create({
    tokenable_type: 'User',
    tokenable_id: user.id,
    name: email,
    token: tokenValue,
    last_used_at: new Date(),
    expires_at: expiresAt
  });
  return tokenValue;
};

module.exports = { generatePersonalAccessToken };
