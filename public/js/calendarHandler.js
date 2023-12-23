import axios from 'axios';

export const addReminder = async (data) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/calendar/',
      data
    });

    if(res.data.status === 'success') {
      return true;
    }
  } catch (err) {
    console.log(err);
  }
}
export const editReminder = async (id, data) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: `/api/calendar/${id}`,
      data
    });

    if(res.data.status === 'success') {
      return true;
    }
  } catch (err) {
    console.log(err);
  }
}
export const deleteReminder = async (id) => {
  try {
    const res = await axios({
      method: 'DELETE',
      url: `/api/calendar/${id}`
    });

    if(res.data.status === 'success') {
      return true;
    }
  } catch (err) {
    console.log(err);
  }
}

export const getModuleAndPeriod = async(module, from, to) => {
  try {
    const res = await axios({
      method: 'POST',
      url: `/api/calendar/module-and-period/`,
      data: {module, from, to}
    });

    if(res.data.status === 'success') {
      return res.data.data.reminders
    }
  } catch(err) {
    console.log(err);
  }
}
export const getFarmReminders = async( from, to) => {
  try {
    const res = await axios({
      method: 'POST',
      url: `/api/calendar/farm-and-period/`,
      data: {from, to}
    });

    if(res.data.status === 'success') {
      return res.data.data.reminders
    }
  } catch(err) {
    console.log(err);
  }
}