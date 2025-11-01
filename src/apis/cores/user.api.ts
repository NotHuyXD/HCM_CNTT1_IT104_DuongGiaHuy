/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unused-vars */
import axios from "axios";
import * as jose from "jose";

export interface userData {
  username: string;
  email: string;
  password: string;
}

export interface loginData {
  email: string;
  password: string;
}

export const UserApi = {
  signUp: async (data: userData) => {
    const result = await axios.get(
      `${import.meta.env.VITE_SV_HOST}/users?email=` + data.email
    );
    if (result.data.length > 0) {
      throw {
        message: "Email da ton tai",
      };
    }

    const newUser = await axios
      .post(`${import.meta.env.VITE_SV_HOST}/users`, data)
      .then((res) => {
        return res.data;
      })
      .catch((res) => {
        console.log("Loi dang ky",res);
      });
    return newUser;
  },

  signIn: async (data: loginData) => {
    let result = await axios.get(
      `${import.meta.env.VITE_SV_HOST}/users?email=` + data.email
    );
    if (result.data.length == 0) {
      throw {
        data:null,
        message: "Tai khoan ko ton tai",
      };
    } else {
      if (result.data[0].password != data.password) {
        throw {
          data:null,
          message: "Mat khau ko chinh xac",
        };
      } else {
        return createToken(result.data[0].id);
      }
    }
  },

  me: async (token: string) => {
    let tokenData = await decodeToken(token);

    if (!tokenData) {
      throw {
        message: "Token không chính xác!",
      };
    }

    let { userId } = tokenData;

    let getUserByIdRes = await axios.get(
      `${import.meta.env.VITE_SV_HOST}/users/${userId}`
    );

    if (!getUserByIdRes.data) {
      throw {
        message: "Lỗi lấy dữ liệu",
      };
    }

    let data = await new Promise((resolve) => {
      setTimeout(() => {
        resolve(getUserByIdRes.data);
      }, 1000);
    });

    return data;
  },
};

async function createToken(userId: string) {
  const secret = new TextEncoder().encode(import.meta.env.VITE_JWT_TOKEN);

  const token = await new jose.SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(secret);
  return token;
}

async function decodeToken(token: string) {
  try {
    const secret = new TextEncoder().encode(import.meta.env.VITE_JWT_TOKEN);

    const { payload } = await jose.jwtVerify(token, secret, {
      algorithms: ["HS256"],
    });

    return payload;
  } catch (error) {
    console.error("Token không hợp lệ hoặc đã hết hạn:", error);
    return null;
  }
}
