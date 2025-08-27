const Country = require('../models/country');
const Symptom = require('../models/symptom');


async function getAllCountries(req, res) {
    try {
        const countries = await Country.find(); // Mongoose method to fetch all countries
        const countriesData = countries.map((country) => ({
            id: country._id,  // Use _id as id in response
            country_name: country.country_name,  // Assuming the field name is 'country_name'
            flag: country.flag,  // Assuming the 'flag' field exists in your model
            code: country.code,  // Assuming the 'code' field exists in your model
            display: country.display,  // Assuming the 'display' field exists in your model
            inforce: country.inforce,  // Assuming the 'inforce' field exists in your model
            remarks: country.remarks,  // Assuming the 'remarks' field exists in your model
            created_at: country.createdAt,  // Assuming the 'createdAt' field exists in your model
            updated_at: country.updatedAt, 
        }));

        // Return the data in the required format
        res.json({
            countriesData
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ 
            status: 'error',
            message: 'Error fetching countries',
            error: err.message
        });
    }
}

async function getAllSymptomsType(req, res) {
    try {
        const symptoms = await Symptom.find(); // Mongoose method to fetch all countries
        const sympTypes = symptoms.map((typ) => ({
            id: typ._id,  
            category: typ.category,  
            descriptions: typ.descriptions,  
            display: typ.display, 
            inforce: typ.inforce,
            created_at: typ.createdAt,  
            updated_at: typ.updatedAt, 
        }));

        // Return the data in the required format
        res.json({
            sympTypes
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ 
            status: 'error',
            message: 'Error fetching countries',
            error: err.message
        });
    }
}

module.exports = {
    getAllCountries,
    getAllSymptomsType,
}