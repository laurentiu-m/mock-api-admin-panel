import { faker } from "@faker-js/faker";
import { axiosInstance } from "../api/axios";
import { User } from "../types";

const getUsers = async (): Promise<User[]> => {
  const response = await axiosInstance.get<User[]>("/users");
  return response.data;
};

const updateUser = (user: User): User => {
  return {
    ...user,
    gender: faker.helpers.arrayElement(["male", "female", "prefer_not_to_say"]),
    password: faker.internet.password(),
    role: faker.helpers.arrayElement(["admin", "moderator", "user"]),
  };
};

const updateUsersData = async () => {
  try {
    const users = await getUsers();

    for (const user of users) {
      const updatedUser = updateUser(user);
      await axiosInstance.patch(`/users/${user.id}`, updatedUser);
    }
  } catch (error) {
    console.error("Error fetching data: ", error);
  }
};

updateUsersData();
