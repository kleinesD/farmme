import axios from 'axios';



export const login = async (data) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/users/login',
      data
    });

    if (res.data.status === 'success') {
      return true;
    }
  } catch (err) {
    console.log(err)
  }
}

export const logout = async () => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/users/logout'
    });

    if (res.data.status === 'success') {
      return true;
    }
  } catch (err) {
    console.log(err);
  }
}

export const editFarm = async (farmId, data) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: `/api/farms/edit-farm/${farmId}`,
      data
    });

    if (res.data.status === 'success') {
      return true;
    }
  } catch (err) {
    console.log(err);
  }
}

export const checkEmail = async (email) => {
  try {
    const res = await axios({
      method: 'GET',
      url: `/api/users/check-email/${email}`
    });

    if (res.data.status === 'success') {
      return res.data.data.response;
    }
  } catch (err) {
    console.log(err);
  }
}

export const editUser = async (userId, data) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: `/api/users/edit-user/${userId}`,
      data
    });

    if (res.data.status === 'success') {
      return true;
    }
  } catch (err) {
    console.log(err);
  }
}