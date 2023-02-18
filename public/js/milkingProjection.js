import axios from 'axios';

export const getMilkingProjection = async (animalId) => {
    let animal, farmAnimals, allAnimals;

    /* GET ALL REQUIRED DATA */
    try {
        let result = await axios({
            method: 'GET',
            url: `/api/animals/milking-projection/${animalId}`
        });

        if(result.data.status === 'success') {
            animal = res.data.data.animal;
            farmAnimals = res.data.data.farmAnimals;
            allAnimals = res.data.data.allAnimals;
        }
    } catch(err) {
        console.log(err);
    }

    farmAnimals = farmAnimals.map(animal => {
        
    });
    
};