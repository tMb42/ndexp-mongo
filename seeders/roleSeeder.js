const Role = require('../models/role'); // Adjust the path to your model as needed

module.exports = async () => {
  try {
    // Delete all existing roles to start fresh
    await Role.deleteMany({});
    console.log('Deleted all existing roles.'.bgRed.white);

    const roles = [
      { name: 'super_admin', label: 'Super Admin'},
      { name: 'admin', label: 'Admin'},
      { name: 'doctor', label: 'Doctor'},
      { name: 'patient', label: 'Patient'},
      { name: 'user', label: 'User'},
    ];

    for (const item of roles) {
      const { name, label } = item;
      const existingRole = await Role.findOne({ name, label });
      if (!existingRole) {
        await Role.create({ name, label });
      } else {
        console.log(`Duplicate found for role: ${name} with label ${label}. Skipping insertion.`.bgYellow.black);
      }
    }

    console.log('Roles inserted successfully.');
  } catch (error) {
    console.error('Error while seeding roles:', error);
  }
};
