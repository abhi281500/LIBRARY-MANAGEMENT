import Library from '../models/library.models.js'

export const createLibrary = async (req, res) => {
    try {
        const { name, openTime, closeTime, address, phone, description, totalSeats } = req.body;
        if (!name || !openTime || !closeTime || !address || !phone || !totalSeats) {
            return res.status(400).json({ message: 'Please fill all required fields' });
        }
        const owner = req.user._id;
        if (!owner) {
            return res.status(400).json({ message: 'Owner is required' });
        }
        const existingLibrary = await Library.findOne({
            owner: req.user._id
        });

        if (existingLibrary) {
            return res.status(409).json({
                message: "Library already exists for this owner"
            });
        }

        const newLibrary = await Library.create({
            name,
            openTime,
            closeTime,
            address,
            phone,
            description,
            totalSeats,
            owner
        });
        return res.status(201).json({
            message: 'Library created successfully',
            library: newLibrary
        });

    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}


export const getAllLibraries = async (req, res) => {
    try {
        const Libraries = await Library.find().populate('owner', 'name email phone');
        return res.status(200).json({
            message: 'Libraries fetched successfully',
            libraries: Libraries
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}


export const getLibraryById = async (req, res) => {
    try {
        const { id } = req.params;
        const library = await Library.findById(id).populate('owner', 'name email phone');
        if (!library) {
            return res.status(404).json({ message: 'Library not found' });
        }
        return res.status(200).json({
            message: 'Library fetched successfully',
            library: library
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const updateLibrary = async (req, res) => {
    try {
        const { id } = req.params;
        const { openTime, closeTime, address, phone, description, totalSeats } = req.body;


        const library = await Library.findById(id);

        if (!library) {
            return res.status(404).json({
                message: "Library not found"
            });
        }

        // Agar SUPER_ADMIN nahi hai to ownership check karo
        if (
            req.user.role !== "SUPER_ADMIN" &&
            library.owner.toString() !== req.user._id.toString()
        ) {
            return res.status(403).json({
                message: "You are not allowed to update this library"
            });
        }

        // Update
        library.openTime = openTime || library.openTime;
        library.closeTime = closeTime || library.closeTime;
        library.address = address || library.address;
        library.phone = phone || library.phone;
        library.description = description || library.description;
        library.totalSeats = totalSeats || library.totalSeats;

        await library.save();

        return res.status(200).json({
            message: "Library updated successfully",
            library
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
};


export const deleteLibrary = async (req, res) => {
    try {
        const { id } = req.params;

        const library = await Library.findById(id);

        if (!library) {
            return res.status(404).json({
                message: "Library not found"
            });
        }

        if (
            req.user.role !== "SUPER_ADMIN" &&
            library.owner.toString() !== req.user._id.toString()
        ) {
            return res.status(403).json({
                message: "You are not allowed to delete this library"
            });
        }

        await library.deleteOne();

        return res.status(200).json({
            message: "Library deleted successfully"
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
};