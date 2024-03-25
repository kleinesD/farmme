import axios from 'axios';

export const getNotifications = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: '/api/notifications/'
    })

    if (res.data.status === 'success') return res.data.data.notifications;

  } catch (err) {
    console.log(err);
  }
};

export const updateNotification = async (data, id) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: `/api/notifications/${id}`,
      data
    });

    if (res.data.status === 'success') return true;
    
  } catch (err) {
    console.log(err);
  }
};

export const deleteNotification = async (id) => {
  try {
    const res = await axios({
      method: 'DELETE',
      url: `/api/notifications/${id}`
    });

    if (res.data.status === 'success') return true;

  } catch (err) {
    console.log(err);
  }
};