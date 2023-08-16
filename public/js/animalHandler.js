import axios from 'axios';


export const addAnimal = async (data) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/animals/',
      data
    });

    if (res.data.status === 'success') {
      return res.data.data.animal;
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

export const getAnimalByNumber = async(number) => {
  try {
    const res = await axios({
      method: 'GET',
      url: `/api/animals/animal-by-number/${number}`
    });

    if (res.data.status === 'success') {
      return res.data.data.animal
    }
  } catch (err) {
    console.log(err);
  }
};

export const checkByField = async(field, value) => {
  try {
    const res = await axios({
      method: 'GET',
      url: `/api/animals/check-by-field/${field}/${value}`
    });

    if (res.data.status === 'success') {
      return res.data.data.exist
    }
  } catch (err) {
    console.log(err);
  }
};

export const getAnimalsForGraph = async(farmId) => {
  try {
    let res = await axios({
      method: 'GET',
      url: `/api/farms/get-projection-data/${farmId}`
    });

    if (res.data.status === 'success') return res.data.data;

  } catch (err) {
    console.log(err);
  }
}