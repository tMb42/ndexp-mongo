const Medicine = require('../models/medication');

exports.saveMedicineDetails = async (req, res) => {
  try {
    const { 
      medName,
      kingdom,
      family,
      miasm,
      temperament,
      diathisis,
      thermalReaction,
      personility,
      notes,
      remarks 
    } = req.body;
     
    // Function to split values by commas and capitalize each value
    const splitByCommaAndCapitalize = (field) => {
      if (field && typeof field === 'string') {
        return field.split(',').map(item => capitalizeWords(item.trim())); // Split by comma and capitalize each word
      }
      return field ? [capitalizeWords(field)] : []; // If not a string or empty, return as a single-item array with capitalized value
    };

    // Ensure all fields are arrays and apply sentenceCase
    const newMedicine = new Medicine({
      medName: capitalizeWords(medName),
      kingdom: splitByCommaAndCapitalize(kingdom), 
      family: splitByCommaAndCapitalize(family),
      miasm: splitByCommaAndCapitalize(miasm), 
      temperament: splitByCommaAndCapitalize(temperament), 
      diathisis: splitByCommaAndCapitalize(diathisis), 
      thermalReaction: splitByCommaAndCapitalize(thermalReaction), 
      personility: splitByCommaAndCapitalize(personility), 
      notes: notes ? sentenceCase(notes) : null, 
      remarks: remarks ? sentenceCase(remarks) : null, 
    });

    const savedMedicine = await newMedicine.save();
    
    return res.status(201).json({
      success: 1,
      message: 'Medicine saved successfully',
      dataMedicine: savedMedicine,
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    return res.status(500).json({
      success: 0,
      message: 'An error occurred while creating the appointment',
    });
  }
};

// Fetch all medicine data with pagination and sorting
exports.getAllMedicines = async (req, res) => {
  try {
    const { page, per_page, orderBy, sort_by } = req.query;
    
    // Convert to integers
    const pageNumber = parseInt(page);
    const itemsPerPage = parseInt(per_page);

     // Calculate the number of documents to skip based on the page number and limit
     const skip = (pageNumber - 1) * itemsPerPage;

    // Fetch sorted and paginated data
    const medicines = await Medicine.find()
      .sort({ [sort_by]: orderBy === 'asc' ? 1 : -1 })
      .skip(skip)
      .limit(itemsPerPage);

    // Total count
    const total_medicines = await Medicine.countDocuments();

    // Calculate total pages
    const total_pages = Math.ceil(total_medicines / itemsPerPage);

    res.status(200).json({
      success: 1,
      dataMedicine: medicines,
      total_medicines,
      total_pages,
      current_page: page,
      itemsPerPage,
    });
  } catch (error) {
    res.status(500).json({ success: 0,  message: error, });
  }
};

exports.getMedicineDetailsById = async (req, res) => {
  try {
    const medicineId = req.params.id; // Extract ID from route parameter

    // Fetch medicine details by ID
    const medicine = await Medicine.findById(medicineId);

    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }

    res.status(200).json({
      success: 1,
      dataMedicine: medicine,
      message: 'Fetch Medicine data successfully!',
    });
  } catch (error) {
    console.error('Error fetching medicine details:', error);
    res.status(500).json({ message: 'An error occurred', error });
  }
};

exports.updateMedicineById = async (req, res) => {
  try {
    const {medName, kingdom, family, miasm, temperament, diathisis, thermalReaction, personility, notes, remarks } = req.body;
    
    const updateData = {};
    
    if (medName) updateData.medName = capitalizeWords(medName);
    updateData.kingdom = splitByCommaAndCapitalize(kingdom);
    updateData.family = splitByCommaAndCapitalize(family);
    updateData.miasm = splitByCommaAndCapitalize(miasm);
    updateData.temperament = splitByCommaAndCapitalize(temperament);
    updateData.diathisis = splitByCommaAndCapitalize(diathisis);
    updateData.thermalReaction = splitByCommaAndCapitalize(thermalReaction);
    updateData.personility = splitByCommaAndCapitalize(personility);
    updateData.notes =sentenceCase(notes);
    updateData.remarks = sentenceCase(remarks);

    // Use findByIdAndUpdate to update the medicine document
    const updatedMedicine = await Medicine.findByIdAndUpdate({ _id: req.body._id }, updateData, { new: true });
    if (!updatedMedicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }
    res.status(200).json({
      success: 1,
      updatedMedicine: updatedMedicine,
      message: 'Medicine update successfully!',
    });
    
  } catch (error) {
    console.error('Error updating medicine:', error);
    res.status(500).json({ message: 'An error occurred while updating', error });
  }
};

// Search medicine details
exports.searchMedicineDetails = async (req, res) => {
  try {
    const { query } = req.body; // Extract query from the request body

    if (!query) {
      return res.status(400).json({ error: 'Search query is required.' });
    }

    // Perform a search in the medications collection
    const results = await Medicine.find({
      $or: [
        { medName: { $regex: query, $options: 'i' } },
        { kingdom: { $regex: query, $options: 'i' } },
        { family: { $regex: query, $options: 'i' } },
        { miasm: { $regex: query, $options: 'i' } },
        { temperament: { $regex: query, $options: 'i' } },
        { diathisis: { $regex: query, $options: 'i' } },
        { thermalReaction: { $regex: query, $options: 'i' } },
        { personility: { $regex: query, $options: 'i' } },
        { notes: { $regex: query, $options: 'i' } },
        { remarks: { $regex: query, $options: 'i' } },
      ],
    });

    res.status(200).json({
      success: 1,
      searchMedicine: results
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while searching.' });
  }
};