
import api from "../api/axios.js";

export const createStudent  = async (payload)=>{
    const { data } = await api.post("/students", payload);
    return data;
}
export const  getAllStudents  =async () =>{
    const { data } = await api.get("/students");
    return data ;
}
export const  getStudentById =async (id)=>{
    const {data }  = await api.get(`/students/${id}`);
    return data ;
}
export const  updateStudent = async ({id, payload})=>{
    const { data } = await api.put(`/students/${id}`, payload);
    return data ;
}
export const  deleteStudent = async (id) => {
    const { data } = await api.delete(`/students/${id}`);
    return data ;
}

