import axios from 'axios';

export const getMilkingProjection = async (animalId) => {
    let animal = [], farmAnimalsRes = [], allAnimalsRes =  [];

    /* GET ALL REQUIRED DATA */
    let data;
    try {
        let result = await axios({
            method: 'GET',
            url: `/api/animals/milking-projection/${animalId}`
        });

        if (result.data.status === 'success') {
            data = result.data.data;
            //animal = result.data.data.animal;
        }
    } catch (err) {
        console.log(err);
    }

    data.allAnimals.forEach(animal => {
        animal.milkingResults.forEach(res => {
            console.log(animal, res.lactationNumber)
            allAnimalsRes.push({
                result: parseFloat(res.result),
                date: new Date(res.date),
                lactation: parseFloat(res.lactationNumber),
                lactationStart: new Date(animal.lactations[res.lactationNumber - 1].startDate)
            });
        });
    });
    data.farmAnimals.forEach(animal => {
        animal.milkingResults.forEach(res => {
            farmAnimalsRes.push({
                result: parseFloat(res.result),
                date: new Date(res.date),
                lactation: parseFloat(res.lactationNumber),
                lactationStart: new Date(animal.lactations[res.lactationNumber - 1].startDate)
            });
        });
    });

    console.log(animal, farmAnimalsRes, allAnimalsRes);

};