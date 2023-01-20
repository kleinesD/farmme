import axios from 'axios';


export const addAnimal = async (data) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/animals/',
      data
    });

    if (res.data.status === 'success') {
      setTimeout(() => { location.assign(`/herd/animal-card/${res.data.data.animal._id}`) }, 2000)
    }
  } catch (err) {
    console.log(err);
  }
};

export const editAnimal = async (animalId, data) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: `/api/animals/${animalId}`,
      data
    });

    if (res.data.status === 'success') {
      return true;
    }
  } catch (err) {
    console.log(err);
  }
}

export const addAnimalResults = async (type, animalId, data) => {
  try {
    const response = await axios({
      method: 'POST',
      url: `/api/animals/${type}/${animalId}`,
      data
    });

    if (response.data.status === 'success') {
      return true
    }
  } catch (err) {
    console.log(err);
  }
};

export const editAnimalResults = async (type, animalId, index, data) => {
  try {
    const response = await axios({
      method: 'PATCH',
      url: `/api/animals/${type}/${animalId}/${index}`,
      data
    });

    if (response.data.status === 'success') {
      return true
    }
  } catch (err) {
    console.log(err);
  }
}

export const deleteAnimalResults = async (type, animalId, itemId) => {
  try {
    const response = await axios({
      method: 'DELETE',
      url: `/api/animals/${type}/${animalId}/${itemId}`
    });

    if (response.data.status === 'success') {
      return true;
    }
  } catch (err) {
    console.log(err);
  }
}

export const writeOffAnimal = async (animalId, data) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: `/api/animals/write-off/animal/${animalId}`,
      data
    });

    if (res.data.status === 'success') {
      return true;
    }
  } catch (err) {
    console.log(err);
  }
}

export const writeOffMultipleAnimals = async (data) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: `/api/animals/write-off/multiple-animals/`,
      data
    });

    if (res.data.status === 'success') {
      return true;
    }
  } catch (err) {
    console.log(err);
  }
}

export const bringBackAnimal = async(animalId) => {
  try{
    const res = await axios({
      method: 'PATCH',
      url: `/api/animals/bring-back-animal/${animalId}`
    });

    if(res.data.status === 'success') {
      return true;
    }
  }catch(err) {
    console.log(err);
  }
};