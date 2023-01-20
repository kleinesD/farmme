import axios from 'axios';

export const addVetAction = async (animalId, data) => {
  try {
    const res = await axios({
      method: 'POST',
      url: `/api/vet/action/${animalId}`,
      data
    });

    if (res.data.status === 'success') {
      return true;
    }
  } catch (err) {
    console.log(err);
  }
}
export const editVetAction = async (actionId, data) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: `/api/vet/action/${actionId}`,
      data
    });

    if (res.data.status === 'success') {
      return true;
    }
  } catch (err) {
    console.log(err);
  }
}

export const addVetProblem = async (animalId, data) => {
  try {
    const res = await axios({
      method: 'POST',
      url: `/api/vet/problem/${animalId}`,
      data
    });

    if (res.data.status === 'success') {
      return true;
    }
  } catch (err) {
    console.log(err);
  }
}

export const editVetProblem = async (problemId, data) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: `/api/vet/problem/${problemId}`,
      data
    });

    if (res.data.status === 'success') {
      return true;
    }
  } catch (err) {
    console.log(err);
  }
}

export const addVetTreatment = async ( diseaseId, data) => {
  try {
    const res = await axios({
      method: 'POST',
      url: `/api/vet/treatment/${diseaseId}`,
      data
    });

    if (res.data.status === 'success') {
      return true;
    }
  } catch (err) {
    console.log(err);
  }
}
export const editVetTreatment = async (treatmentId, data) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: `/api/vet/treatment/${treatmentId}`,
      data
    });

    if (res.data.status === 'success') {
      return true;
    }
  } catch (err) {
    console.log(err);
  }
}

export const addVetSchedule = async (data) => {
  try {
    const res = await axios({
      method: 'POST',
      url: `/api/vet/schedule/`,
      data
    });

    if (res.data.status === 'success') {
      return true;
    }
  } catch (err) {
    console.log(err);
  }
}

export const addVetScheme = async (data) => {
  try {
    const res = await axios({
      method: 'POST',
      url: `/api/vet/create-scheme/`,
      data
    });

    if (res.data.status === 'success') {
      return true;
    }
  } catch (err) {
    console.log(err);
  }
}

export const getSchedulePeriod = async (farmId, from, to) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/vet/schedule/period',
      data: {farmId, from, to }
    });

    if(res.data.status === 'success') {
      return res.data.data.actions;
    }
  } catch (err) {
    console.log(err);
  }
}

export const startVetScheme = async(animalId, schemeId, date) => {
  try {
    const res = await axios({
      method: 'POST',
      url: `/api/vet/use-scheme/${animalId}`,
      data: {
        schemeId, date
      }
    });

    if(res.data.status === 'success') {
      return true;
    }
  }catch(err) {
    console.log(err);
  }
}

export const editStartedVetScheme = async(firstSchemeActionId, schemeId, date) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: `/api/vet/edit-started-scheme/${firstSchemeActionId}`,
      data: {
        schemeId, date
      }
    });

    if(res.data.status === 'success') {
      return true;
    }
  }catch(err) {
    console.log(err);
  }
}

export const editVetScheme = async(schemeId, data) => {
  try {
    const res = await axios({
      method: 'POST',
      url: `/api/vet/edit-scheme/${schemeId}`,
      data
    });

    if(res.data.status === 'success') {
      return true;
    }
  }catch(err) {
    console.log(err);
  }
}