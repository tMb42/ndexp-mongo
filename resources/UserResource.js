class UserResource {
  
  constructor(user){this.user = user;} 

  toJSON() {
    const {
      UserProfile = {},
      id,
      name,
      email,
      email_verified_at,
      created_at,
      updated_at
    } = this.user;

    const roleDetails = this.user.Roles ? this.user.Roles.map(x => ({
      id: x.id,
      name: x.name,
      label: x.label
    })) : [];

    // For Extract 'name' attribute in Role model
    const roles = this.user.Roles ? this.user.Roles.map(x => x.name) : [];

    const {
      gender,
      dob: dobSQL,
      mobile_no: mobile,
      display,
      inforce
    } = UserProfile;
  
    
    // const photo = Profile ? Profile.photoUrl : '';
    
    return {
      id,
      name,
      email,
      email_verified_at,
      created_at,
      updated_at,
      roleId: roleDetails,
      roles,
      gender,
      dobSQL,
      mobile,
      display,
      inforce,
      // photo
    };
  }
}
  
module.exports = UserResource;
