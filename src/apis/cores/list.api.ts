import axios from "axios";

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
