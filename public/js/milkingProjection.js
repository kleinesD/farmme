import axios from 'axios';

export const getMilkingProjection = async (animalId) => {
    let animalRes = [], farmAnimalsRes = [], allAnimalsRes = [];

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

    /* MOVING ACTUALL RESULTS TO ARRAYS */
    data.animal.milkingResults.forEach(res => {
        if (res.lactationNumber) {
            animalRes.push({
                result: parseFloat(res.result),
                date: new Date(res.date),
                lactation: parseFloat(res.lactationNumber),
                lactationStart: new Date(data.animal.lactations.find(el => el.number === res.lactationNumber).startDate)
            });
        }
    });

    data.allAnimals.forEach(animal => {
        animal.milkingResults.forEach(res => {
            if (res.lactationNumber) {
                allAnimalsRes.push({
                    result: parseFloat(res.result),
                    date: new Date(res.date),
                    lactation: parseFloat(res.lactationNumber),
                    lactationStart: new Date(animal.lactations.find(el => el.number === res.lactationNumber).startDate)
                });

                console.log(new Date(animal.lactations.find(el => el.number === res.lactationNumber).startDate));
            }
        });
    });

    data.farmAnimals.forEach(animal => {
        animal.milkingResults.forEach(res => {
            if (res.lactationNumber) {
                farmAnimalsRes.push({
                    result: parseFloat(res.result),
                    date: new Date(res.date),
                    lactation: parseFloat(res.lactationNumber),
                    lactationStart: new Date(animal.lactations.find(el => el.number === res.lactationNumber))
                });
            }
        });
    });

    console.log(farmAnimalsRes)

    /* SORTING ALL ARRAYS BY LACTATION NUMBER AND MONTH INTO THE LACTATION */
    let animalResSorted = [], farmAnimalsResSorted = [], allAnimalsResSorted = [];

    animalRes.forEach((res) => {
        let month = Math.round((res.date.getTime() - res.lactationStart.getTime()) / 30 / 24 / 60 / 60 / 1000);
        if(animalResSorted.length === 0) {
            animalResSorted.push({
                lactation: res.lactation,
                monthIn: month,
                results: [res]
            });
        } else {
            let push = true;
            animalResSorted.forEach(resSort => {
                if(resSort.lactation === res.lactation && resSort.monthIn === month) {
                    resSort.result.push(res);
                    push = false;
                }
            });

            if(push) {
                animalResSorted.push({
                    lactation: res.lactation,
                    monthIn: month,
                    results: [res]
                });
            }
        }
    });

    farmAnimalsRes.forEach((res) => {
        let month = Math.round((res.date.getTime() - res.lactationStart.getTime()) / 30 / 24 / 60 / 60 / 1000);
        if(farmAnimalsResSorted.length === 0) {
            farmAnimalsResSorted.push({
                lactation: res.lactation,
                monthIn: month,
                results: [res]
            });
        } else {
            let push = true;
            farmAnimalsResSorted.forEach(resSort => {
                if(resSort.lactation === res.lactation && resSort.monthIn === month) {
                    resSort.result.push(res);
                    push = false;
                }
            });

            if(push) {
                farmAnimalsResSorted.push({
                    lactation: res.lactation,
                    monthIn: month,
                    results: [res]
                });
            }
        }
    });

    

};