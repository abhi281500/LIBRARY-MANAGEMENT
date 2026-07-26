import express from "express";
import { createStudent, getAllStudents, getStudentById, updateStudent, deleteStudent } from "../controllers/student.controller.js";
import auth from "../middlewares/auth.middlewares.js"
import roleMiddleware from "../middlewares/role.middlewares.js"
const router = express.Router();

router.post("/",
    auth,
    roleMiddleware("LIBRARY_OWNER", "SUPER_ADMIN"),
     createStudent);    


router.get("/",auth,
    roleMiddleware("LIBRARY_OWNER", "SUPER_ADMIN"),
     getAllStudents);


router.get("/:id",auth,
    roleMiddleware("LIBRARY_OWNER", "SUPER_ADMIN"),
     getStudentById);


router.put("/:id",auth,
    roleMiddleware("LIBRARY_OWNER", "SUPER_ADMIN"),
     updateStudent);


router.delete("/:id",auth,
    roleMiddleware("LIBRARY_OWNER", "SUPER_ADMIN"),
     deleteStudent);

export default router;