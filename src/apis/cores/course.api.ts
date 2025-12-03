/* eslint-disable @typescript-eslint/no-unused-vars */
import axios from 'axios'
import type {course} from "../../types/course.type"

interface newCourse{
    title:string,
    backdrop:string,
    type:string
}

export const CourseApi={
    createCourse:async (data:newCourse)=>{
        axios
        .post(`${import.meta.env.VITE_SV_HOST}/courses`,data)
        .then((res)=>console.log(res.data))
        .catch((res) => {
        console.log("Loi tao course",res);
      });
    },
}