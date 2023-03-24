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