import express from "express";
import { createStudent, getAllStudents, getStudentById, updateStudent, deleteStudent } from "../controllers/student.controller.js";
import auth from "../middlewares/auth.middlewares.js"
import roleMiddleware from "../middlewares/role.middlewares.js"
const router = express.Router();

router.post("/students",
    auth,
    roleMiddleware("LIBRARY_OWNER", "SUPER_ADMIN"),
     createStudent);    


router.get("/students",auth,
    roleMiddleware("LIBRARY_OWNER", "SUPER_ADMIN"),
     getAllStudents);


router.get("/students/:id",auth,
    roleMiddleware("LIBRARY_OWNER", "SUPER_ADMIN"),
     getStudentById);


router.put("/students/:id",auth,
    roleMiddleware("LIBRARY_OWNER", "SUPER_ADMIN"),
     updateStudent);


router.delete("/students/:id",auth,
    roleMiddleware("LIBRARY_OWNER", "SUPER_ADMIN"),
     deleteStudent);

export default router;