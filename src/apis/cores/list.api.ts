import axios from "axios";
import type { list } from "../../types/list.type";

interface newList {
  boardId: string;
  title: string;
  created_at: string;
}

export const ListApi = {
  createList: async (data: newList) => {
    axios
      .post(`${import.meta.env.VITE_SV_HOST}/lists`, data)
      .then((res) => console.log(res.data))
      .catch((res) => {
        console.log("Loi tao board", res);
      });
  },
};
