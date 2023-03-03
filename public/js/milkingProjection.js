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
        lactationStart: new Date(data.animal.lactations.find(el => el.number === res.lactationNumber).startDate),
        lactationFinish : new Date(data.animal.lactations.find(el => el.number === res.lactationNumber).finishDate) 
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
          lactationStart: new Date(animal.lactations.find(el => el.number === res.lactationNumber).startDate)
        });
      }
    });
  });



  /* SORTING ALL ARRAYS BY LACTATION NUMBER AND MONTH INTO THE LACTATION */
  let animalResSorted = [], farmAnimalsResSorted = [], allAnimalsResSorted = [];

  animalRes.forEach((res) => {
    let month = Math.round((res.date.getTime() - res.lactationStart.getTime()) / 30 / 24 / 60 / 60 / 1000);
    let push = true;
    if (animalResSorted.length === 0) {
      animalResSorted.push({
        lactation: res.lactation,
        monthIn: month,
        results: [res],
        total: res.result,
        average: res.result,
        type: 'actual'
      });
    } else {
      animalResSorted.forEach(resSort => {
        if (resSort.lactation === res.lactation && resSort.monthIn === month) {
          resSort.results.push(res);
          resSort.total += res.result;
          resSort.average = resSort.total / resSort.results.length
          push = false;
        }
      });

      if (push) {
        animalResSorted.push({
          lactation: res.lactation,
          monthIn: month,
          results: [res],
          total: res.result,
          average: res.result,
          type: 'actual'
        });
      }
    }
  });

  farmAnimalsRes.forEach((res) => {
    let month = Math.round((res.date.getTime() - res.lactationStart.getTime()) / 30 / 24 / 60 / 60 / 1000);
    let push = true;
    if (farmAnimalsResSorted.length === 0) {
      farmAnimalsResSorted.push({
        lactation: res.lactation,
        monthIn: month,
        results: [res],
        total: res.result,
        average: res.result
      });
    } else {
      farmAnimalsResSorted.forEach(resSort => {
        if (resSort.lactation === res.lactation && resSort.monthIn === month) {
          resSort.results.push(res);
          resSort.total += res.result;
          resSort.average = resSort.total / resSort.results.length
          push = false;
        }
      });

      if (push) {
        farmAnimalsResSorted.push({
          lactation: res.lactation,
          monthIn: month,
          results: [res],
          total: res.result,
          average: res.result
        });
      }
    }
  });

  allAnimalsRes.forEach((res) => {
    let month = Math.round((res.date.getTime() - res.lactationStart.getTime()) / 30 / 24 / 60 / 60 / 1000);
    let push = true;
    if (allAnimalsResSorted.length === 0) {
      allAnimalsResSorted.push({
        lactation: res.lactation,
        monthIn: month,
        results: [res],
        total: res.result,
        average: res.result
      });
    } else {
      allAnimalsResSorted.forEach(resSort => {
        if (resSort.lactation === res.lactation && resSort.monthIn === month) {
          resSort.results.push(res);
          resSort.total += res.result;
          resSort.average = resSort.total / resSort.results.length
          push = false;
        }
      });

      if (push) {
        allAnimalsResSorted.push({
          lactation: res.lactation,
          monthIn: month,
          results: [res],
          total: res.result,
          average: res.result
        });
      }
    }
  });

  animalResSorted.sort((a, b) => a.lactation - b.lactation || a.monthIn - b.monthIn);
  farmAnimalsResSorted.sort((a, b) => a.lactation - b.lactation || a.monthIn - b.monthIn);
  allAnimalsResSorted.sort((a, b) => a.lactation - b.lactation || a.monthIn - b.monthIn);



  /* GETTING THE PERCENTAGE INCREASE OR DECREASE MONTH TO MONTH*/
  animalResSorted.forEach((res, inx, arr) => {
    if (arr[inx + 1] !== undefined && res.lactation === arr[inx + 1].lactation && res.monthIn + 1 === arr[inx + 1].monthIn) {
      arr[inx + 1].diffPercent = 100 * ((arr[inx + 1].average - res.average) / ((res.average + arr[inx + 1].average) / 2))
    }
  });

  farmAnimalsResSorted.forEach((res, inx, arr) => {
    if (arr[inx + 1] !== undefined && res.lactation === arr[inx + 1].lactation && res.monthIn + 1 === arr[inx + 1].monthIn) {
      arr[inx + 1].diffPercent = 100 * ((arr[inx + 1].average - res.average) / ((res.average + arr[inx + 1].average) / 2))
    }
  });

  allAnimalsResSorted.forEach((res, inx, arr) => {
    if (arr[inx + 1] !== undefined && res.lactation === arr[inx + 1].lactation && res.monthIn + 1 === arr[inx + 1].monthIn) {
      arr[inx + 1].diffPercent = 100 * ((arr[inx + 1].average - res.average) / ((res.average + arr[inx + 1].average) / 2))
    }
  });

  /* PROJECTING THE DATA */
  let baseChangeDuringLactation = [0, 50, 33, -11, -12, -13, -14, -15, -16, -17, -18]

  let lastActLact = data.animal.lactations[data.animal.lactations.length - 1].number;
  let firstProjLact = lastActLact + 1;

  let existingResults = animalResSorted.filter(el => el.lactation === lastActLact);
  let resultsToAdd = existingResults[existingResults.length - 1].monthIn;


  baseChangeDuringLactation.forEach((change, inx, arr) => {
    if (inx > resultsToAdd) {
      let total = 0, devider = 0
      let animalPercent = 0, farmPercent = 0, allPercent = 0;

      if (farmAnimalsResSorted.find(el => el.lactation === lastActLact && el.monthIn === inx) !== undefined) farmPercent = farmAnimalsResSorted.find(el => el.lactation === lastActLact && el.monthIn === inx).diffPercent;
      if (allAnimalsResSorted.find(el => el.lactation === lastActLact && el.monthIn === inx) !== undefined) allPercent = allAnimalsResSorted.find(el => el.lactation === lastActLact && el.monthIn === inx).diffPercent;

      total += change * 2;
      devider += 2;
      if (farmPercent !== undefined && farmPercent !== 0) { total += farmPercent * 3; devider += 3 }
      if (allPercent !== undefined && allPercent !== 0) { total += allPercent; devider++ }

      animalResSorted.filter(res => res.monthIn === inx).forEach(res => {
        if (res.diffPercent) {
          total += res.diffPercent;
          devider++;
        }
      })

      let prevNumber;
      if (animalResSorted.find(el => el.lactation === lastActLact && el.monthIn === inx - 1) !== undefined) prevNumber = animalResSorted.find(el => el.lactation === lastActLact && el.monthIn === inx - 1).average;
      prevNumber = prevNumber + (prevNumber / 100 * (total / devider));

      animalResSorted.push({
        lactation: lastActLact,
        monthIn: inx,
        average: prevNumber,
        type: 'projected'
      });

    }
  });

  /* Change in percentage for eacn mongh of lactation */

  for (let i = firstProjLact; i <= 5; i++) {
    baseChangeDuringLactation.forEach((change, inx, arr) => {
      if (inx === 0) {
        let afterChange = [4.92, 4.03, -20.34, -10, -10];
        let numberStart = 10;

        if (animalResSorted.find(el => el.lactation === i - 1 && el.monthIn === 0) !== undefined) numberStart = animalResSorted.find(el => el.lactation === i - 1 && el.monthIn === 0).average;
        let nextNumber = numberStart + (numberStart / 100 * afterChange[i - 2]);

        animalResSorted.push({
          lactation: i,
          monthIn: inx,
          average: nextNumber,
          type: 'projected'
        });
      } else {
        let total = 0, devider = 0
        let animalPercent = 0, farmPercent = 0, allPercent = 0;

        if (farmAnimalsResSorted.find(el => el.lactation === i && el.monthIn === inx) !== undefined) farmPercent = farmAnimalsResSorted.find(el => el.lactation === i && el.monthIn === inx).diffPercent;
        if (allAnimalsResSorted.find(el => el.lactation === i && el.monthIn === inx) !== undefined) allPercent = allAnimalsResSorted.find(el => el.lactation === i && el.monthIn === inx).diffPercent;

        total += change * 2;
        devider += 2;
        if (farmPercent !== undefined && farmPercent !== 0) { total += farmPercent * 3; devider += 3 }
        if (allPercent !== undefined && allPercent !== 0) { total += allPercent; devider++ }

        animalResSorted.filter(res => res.monthIn === inx).forEach(res => {
          if (res.diffPercent) {
            total += res.diffPercent;
            devider++;
          }
        })

        let prevNumber;
        if (animalResSorted.find(el => el.lactation === i && el.monthIn === inx - 1) !== undefined) prevNumber = animalResSorted.find(el => el.lactation === i && el.monthIn === inx - 1).average;
        prevNumber = prevNumber + (prevNumber / 100 * (total / devider));

        animalResSorted.push({
          lactation: i,
          monthIn: inx,
          average: prevNumber,
          type: 'projected'
        });

      }
    });

  }

  return animalResSorted;

};