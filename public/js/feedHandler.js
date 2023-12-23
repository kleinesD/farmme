import axios from 'axios';

export const addFeedSampleOrRecord = async (data) => {
  try {
    let res = await axios({
      method: 'POST',
      url: `/api/feed/`,
      data
    });

    if (res) return true;
  } catch (err) {
    console.log(err);
  }
}
export const editFeedSampleOrRecord = async (id, data) => {
  try {
    let res = await axios({
      method: 'PATCH',
      url: `/api/feed/${id}`,
      data
    });

    if (res) return true;
  } catch (err) {
    console.log(err);
  }
}

export const getOneRecord = async (id) => {
  try {
    let res = await axios({
      method: 'GET',
      url: `/api/feed/${id}`
    });

    if (res.data.status === 'success') return res.data.data.record;

  } catch (err) {
    console.log(err);
  }
}

export const getFeedRecords = async (feedId) => {
  try {
    const res = await axios({
      method: 'GET',
      url: `/api/feed/records/${feedId}`
    });

    if (res.data.status === 'success') return res.data.data.records;
  } catch (err) {
    console.log(err);
  }
};