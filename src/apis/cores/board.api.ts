import axios from 'axios'
import type {board} from "../../types/board.type"

interface newBoard{
    userId:string,
    title:string,
    description:string,
    backdrop:string,
    is_starred:boolean,
    created_at:string
}

export const BoardApi={
    createBoard:async (data:newBoard)=>{
        axios
        .post(`${import.meta.env.VITE_SV_HOST}/boards`,data)
        .then((res)=>console.log(res.data))
        .catch((res) => {
        console.log("Loi tao board",res);
      });
    },
}