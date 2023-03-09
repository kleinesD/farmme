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