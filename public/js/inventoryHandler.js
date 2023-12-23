import axios from 'axios';

export const addInventory = async (data) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/inventory/',
      data
    });

    if(res.data.status === 'success') {
      return true;
    }
  } catch(err) {
    console.log(err);
  }
}
export const editInventory = async (id, data) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: `/api/inventory/${id}`,
      data
    });

    if(res.data.status === 'success') {
      return true;
    }
  } catch(err) {
    console.log(err);
  }
}