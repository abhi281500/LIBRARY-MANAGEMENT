import express from 'express';
import { createLibrary, getAllLibraries, getLibraryById, updateLibrary, deleteLibrary } from '../controllers/library.controller.js';
import auth from '../middlewares/auth.middlewares.js';
import roleMiddleware from '../middlewares/role.middlewares.js';
const router = express.Router();

router.post(
    "/",
    auth,
    roleMiddleware("LIBRARY_OWNER", "SUPER_ADMIN"),
    createLibrary
);

router.get(
    "/",
    auth,
    roleMiddleware("SUPER_ADMIN"),
    getAllLibraries
);

router.get(
    "/:id",
    auth,
    getLibraryById
);

router.put(
    "/:id",
    auth,
    roleMiddleware("LIBRARY_OWNER", "SUPER_ADMIN"),
    updateLibrary
);

router.delete(
    "/:id",
    auth,
    roleMiddleware("LIBRARY_OWNER", "SUPER_ADMIN"),
    deleteLibrary
);router.post(
    "/",
    auth,
    roleMiddleware("LIBRARY_OWNER", "SUPER_ADMIN"),
    createLibrary
);



export default router;