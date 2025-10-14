let users = [
  {
    id: 1,
    username: "John Doe",
    email: "john@example.com",
    "espaiser-coin": 100
  },
];

const getAllUsers = async () => {
  return users;
};

const createUserInDB = async (user) => {
  const newUser = {
    id: users.length + 1,
    username: user.name || user.username,
    email: user.email || `${user.name}@example.com`,
    "espaiser-coin": 100
  };
  users.push(newUser);
  return [newUser];
};

const updateUserInDb = async (newData, userId) => {
  const userIndex = users.findIndex(user => user.id == userId);
  if (userIndex !== -1) {
    users[userIndex] = { ...users[userIndex], ...newData };
    return [users[userIndex]];
  }
  return [];
};

const deleteUserInDb = async (userId) => {
  const userIndex = users.findIndex(user => user.id == userId);
  if (userIndex !== -1) {
    const deletedUser = users.splice(userIndex, 1)[0];
    return [deletedUser];
  }
  return [];
};

module.exports = {
  getAllUsers,
  createUserInDB,
  updateUserInDb,
  deleteUserInDb,
};
