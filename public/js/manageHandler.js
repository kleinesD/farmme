import axios from 'axios';




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
export const addCategory = async (farmId, category) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: `/api/farms/add-category/${farmId}`,
      data: {
        category
      }
    });

    if (res.data.status === 'success') {
      return true;
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