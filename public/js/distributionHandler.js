import axios from "axios";

export const addClient = async (data) => {
    try {
        const res = await axios({
            method: 'POST',
            url: `/api/distribution/client`,
            data
        });

        if(res.data.status === 'success') {
            return true
        }
    } catch(err) {
        console.log(err);
    }
}
export const editClient = async (id, data) => {
    try {
        const res = await axios({
            method: 'PATCH',
            url: `/api/distribution/client/${id}`,
            data
        });

        if(res.data.status === 'success') {
            return true
        }
    } catch(err) {
        console.log(err);
    }
}

export const addProduct = async (data) => {
    try {
        const res = await axios({
            method: 'POST',
            url: `/api/distribution/product`,
            data
        });

        if(res.data.status === 'success') {
            return true
        }
    } catch(err) {
        console.log(err);
    }
}

export const editProduct = async (id, data) => {
    try {
        const res = await axios({
            method: 'PATCH',
            url: `/api/distribution/product/${id}`,
            data
        });

        if(res.data.status === 'success') {
            return true
        }
    } catch(err) {
        console.log(err);
    }
}

export const deleteProduct = async (id) => {
    try {
        const res = await axios({
            method: 'DELETE',
            url: `/api/distribution/product/${id}`
        });

        if(res.data.status === 'success') {
            return true
        }
    } catch(err) {
        console.log(err);
    }
}
export const deleteSubIdProducts = async (subId) => {
    try {
        const res = await axios({
            method: 'DELETE',
            url: `/api/distribution/subIdProducts/${subId}`
        });

        if(res.data.status === 'success') {
            return true
        }
    } catch(err) {
        console.log(err);
    }
}

export const addProductReturn = async (data) => {
    try {
        const res = await axios({
            method: 'POST',
            url: `/api/distribution/product`,
            data
        });

        if(res.data.status === 'success') {
            return res.data.data.product
        }
    } catch(err) {
        console.log(err);
    }
}

export const editProductReturn = async (id, data) => {
    try {
        const res = await axios({
            method: 'PATCH',
            url: `/api/distribution/product/${id}`,
            data
        });

        if(res.data.status === 'success') {
            return res.data.data.product
        }
    } catch(err) {
        console.log(err);
    }
}

export const getClient = async (id, start, end) => {
    try {
        const res = await axios({
            method: 'GET',
            url: `/api/distribution/client/get/${id}/${start}/${end}`
        });

        if(res.data.status === 'success') {
            return res.data.data
        }
    } catch(err) {
        console.log(err);
    }
}