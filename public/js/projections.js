import axios from 'axios';
import moment from 'moment';

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
    if (!res.lactationNumber) return;

    animalRes.push({
      result: parseFloat(res.result),
      date: new Date(res.date),
      lactation: parseFloat(res.lactationNumber),
      lactationStart: new Date(data.animal.lactations.find(el => el.number === res.lactationNumber).startDate),
      lactationFinish: new Date(data.animal.lactations.find(el => el.number === res.lactationNumber).finishDate)
    });

  });

  data.allAnimals.forEach(animal => {
    animal.milkingResults.forEach(res => {
      if (!res.lactationNumber) return;

      allAnimalsRes.push({
        result: parseFloat(res.result),
        date: new Date(res.date),
        lactation: parseFloat(res.lactationNumber),
        lactationStart: new Date(animal.lactations.find(el => el.number === res.lactationNumber).startDate)
      });

    });
  });

  data.farmAnimals.forEach(animal => {
    animal.milkingResults.forEach(res => {
      if (!res.lactationNumber) return;

      farmAnimalsRes.push({
        result: parseFloat(res.result),
        date: new Date(res.date),
        lactation: parseFloat(res.lactationNumber),
        lactationStart: new Date(animal.lactations.find(el => el.number === res.lactationNumber).startDate)
      });

    });
  });



  /* SORTING ALL ARRAYS BY LACTATION NUMBER AND MONTH INTO THE LACTATION */
  let animalResSorted = [], farmAnimalsResSorted = [], allAnimalsResSorted = [];

  animalRes.forEach((res) => {
    let month = Math.round((res.date.getTime() - res.lactationStart.getTime()) / 30 / 24 / 60 / 60 / 1000);
    if (!animalResSorted.find(el => el.lactation === res.lactation && el.monthIn === month)) {
      animalResSorted.push({
        lactation: res.lactation,
        monthIn: month,
        date: res.date,
        results: [res],
        total: res.result,
        average: res.result
      });
    } else {
      const element = animalResSorted.find(el => el.lactation === res.lactation && el.monthIn === month);
      element.results.push(res);
      element.total += res.result;
      element.average = element.total / element.results.length
    }
  });

  farmAnimalsRes.forEach((res) => {
    let month = Math.round((res.date.getTime() - res.lactationStart.getTime()) / 30 / 24 / 60 / 60 / 1000);
    if (!farmAnimalsResSorted.find(el => el.lactation === res.lactation && el.monthIn === month)) {
      farmAnimalsResSorted.push({
        lactation: res.lactation,
        monthIn: month,
        date: res.date,
        results: [res],
        total: res.result,
        average: res.result
      });
    } else {
      const element = farmAnimalsResSorted.find(el => el.lactation === res.lactation && el.monthIn === month);
      element.results.push(res);
      element.total += res.result;
      element.average = element.total / element.results.length
    }
  });

  allAnimalsRes.forEach((res) => {
    let month = Math.round((res.date.getTime() - res.lactationStart.getTime()) / 30 / 24 / 60 / 60 / 1000);
    if (!allAnimalsResSorted.find(el => el.lactation === res.lactation && el.monthIn === month)) {
      allAnimalsResSorted.push({
        lactation: res.lactation,
        monthIn: month,
        date: res.date,
        results: [res],
        total: res.result,
        average: res.result
      });
    } else {
      const element = allAnimalsResSorted.find(el => el.lactation === res.lactation && el.monthIn === month);
      element.results.push(res);
      element.total += res.result;
      element.average = element.total / element.results.length
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

  let lastActLact = data.animal.lactations.at(-1).number;
  let firstProjLact = lastActLact + 1;

  let existingResults = animalResSorted.filter(el => el.lactation === lastActLact);
  let resultsToAdd = existingResults.length > 0 ? existingResults.at(-1).monthIn : -1;


  baseChangeDuringLactation.forEach((change, inx, arr) => {
    if (resultsToAdd === -1 && inx === 0) {
      let afterChange = [4.92, 4.03, -20.34, -10, -10];
      let numberStart = 10;

      if (animalResSorted.find(el => el.lactation === lastActLact - 1 && el.monthIn === 0) !== undefined) numberStart = animalResSorted.find(el => el.lactation === lastActLact - 1 && el.monthIn === 0).average;
      let nextNumber = numberStart + (numberStart / 100 * afterChange[lastActLact - 2]);

      animalResSorted.push({
        lactation: lastActLact,
        monthIn: inx,
        date: new Date(data.animal.lactations.at(-1).startDate),
        average: nextNumber,
        type: 'projected'
      });
    } else if (inx > 0 && inx > resultsToAdd) {
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
      let prevDate;
      if (animalResSorted.find(el => el.lactation === lastActLact && el.monthIn === inx - 1) !== undefined) {
        prevNumber = animalResSorted.find(el => el.lactation === lastActLact && el.monthIn === inx - 1).average;
        prevDate = animalResSorted.find(el => el.lactation === lastActLact && el.monthIn === inx - 1).date;
      }
      prevNumber = prevNumber + (prevNumber / 100 * (total / devider));

      animalResSorted.push({
        lactation: lastActLact,
        monthIn: inx,
        date: new Date(moment(prevDate).add(1, 'month')),
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
          date: new Date(moment(animalResSorted[animalResSorted.length - 1].date).add(3, 'month')),
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
        let prevDate;
        if (animalResSorted.find(el => el.lactation === i && el.monthIn === inx - 1) !== undefined) {
          prevNumber = animalResSorted.find(el => el.lactation === i && el.monthIn === inx - 1).average;
          prevDate = animalResSorted.find(el => el.lactation === i && el.monthIn === inx - 1).date;
        }
        prevNumber = prevNumber + (prevNumber / 100 * (total / devider));

        animalResSorted.push({
          lactation: i,
          monthIn: inx,
          date: new Date(moment(prevDate).add(1, 'month')),
          average: prevNumber,
          type: 'projected'
        });

      }
    });

  }
  return animalResSorted;

};

export const getFarmProjections = async (farmId, yearsAmount) => {
  let data;
  let calfAvg = 12;
  try {
    let res = await axios({
      method: 'GET',
      url: `/api/farms/get-projection-data/${farmId}`
    });

    if (res.data.status === 'success') data = res.data.data;

  } catch (err) {
    console.log(err);
  }

  /* Counting an average between calvings based on lactations | ON HOLD | currently using only avearge data */

  /* data.cows.forEach(cow => {
    if (cow.lactations.length <= 1) return;

    let spanArr = [];
    cow.lactations.forEach((lact, inx, arr) => {
      if (inx === 0) return;

      spanArr.push((new Date(lact.startDate).getTime() - new Date(arr[inx - 1].startDate).getTime()) / 1000 / 60 / 60 / 24 / 30 / 12);
    });
  }); */

  /* Converting animals data into another format */
  let animals = [];
  data.animals.forEach(animal => {
    animals.push({
      status: animal.status,
      gender: animal.gender,
      birthDate: animal.birthDate,
      lastLact: animal.lactations.length > 0 ? animal.lactations[animal.lactations.length - 1].startDate : undefined,
    });
  });


  /* Counting projected data for n amount of years */
  let years = [];
  years.push({ year: 0, animals: JSON.parse(JSON.stringify(animals)) })
  for (let i = 1; i <= yearsAmount; i++) {
    let date = new Date(moment().add(i, 'year'));

    /* Removing animals cuz of illness. For average I took 1.67% death rate.*/
    animals.forEach((animal, inx, arr) => {
      if ((Math.random() * (100 - 0 + 1) + 0) < 1.67) {
        animal.status = 'diseased';
        animal.cause = 'illness';
        animal.dateOfDeath = date;
      };
    });

    /* Removing animals cuz of slaughtering. For average I took 24 months for a bull and 72 months for a cow.*/
    animals.forEach((animal, inx, arr) => {
      if (animal.status === 'diseased') return;
      let ageInMonths = (new Date(date).getTime() - new Date(animal.birthDate).getTime()) / 1000 / 60 / 60 / 24 / 30;

      if (animal.gender === 'male' && ageInMonths >= 24 || animal.gender === 'female' && ageInMonths >= 84) {
        animal.status = 'diseased';
        animal.cause = 'slaughtered';
        animal.dateOfDeath = date;
      };
    });

    /* Adding calvings with average calving interval of 13 months */
    animals.forEach(animal => {
      if (animal.gender === 'male' || animal.status === 'diseased') return;
      let ageInMonths = (new Date(date).getTime() - new Date(animal.birthDate).getTime()) / 1000 / 60 / 60 / 24 / 30;

      if (animal.lastLact && ((new Date(date).getTime() - new Date(animal.lastLact).getTime()) / 1000 / 60 / 60 / 24 / 30) >= 13 || ageInMonths >= 24) {
        animal.lastLact = date;
        let deathDecider = (Math.random() * (100 - 0 + 1) + 0) < 12;
        animals.push({
          status: deathDecider ? 'diseased' : 'alive',
          cause: deathDecider ? 'calving-death' : '',
          dateOfDeath: deathDecider ? date : '',
          gender: (Math.random() * (100 - 0 + 1) + 0) < 50 ? 'female' : 'male',
          birthDate: date,
          lastLact: undefined,
        });
      }
    });

    /* Creating a timeline of herd change */
    /* let animalsBuf = animals.map(animal => { return animal }); */
    let animalsBuf = JSON.parse(JSON.stringify(animals));


    years.push({ year: i, animals: animalsBuf });
  }
  /* years.forEach((year) => {
    console.log({
      year: year.year, 
      cows: year.animals.filter(animal => animal.status === 'alive' && animal.gender === 'female' && ((new Date(moment().add(year.year, 'year')).getTime() - new Date(animal.birthDate).getTime()) / 1000 / 60 / 60 / 24 / 30) >= 24),
      bulls: year.animals.filter(animal => animal.status === 'alive' && animal.gender === 'male' && ((new Date(moment().add(year.year, 'year')).getTime() - new Date(animal.birthDate).getTime()) / 1000 / 60 / 60 / 24 / 30) >= 12),
      calves: year.animals.filter(animal => animal.status === 'alive' && ((new Date(moment().add(year.year, 'year')).getTime() - new Date(animal.birthDate).getTime()) / 1000 / 60 / 60 / 24 / 30) < 12),
      cowsSlaughtered: year.animals.filter(animal => animal.status = 'diseased' && animal.cause === 'slaughtered' && animal.gender === 'female' && moment().add(year.year, 'year').isSame(animal.dateOfDeath, 'year') ),
      bullsSlaughtered: year.animals.filter(animal => animal.status = 'diseased' && animal.cause === 'slaughtered' && animal.gender === 'male' && moment().add(year.year, 'year').isSame(animal.dateOfDeath, 'year') ),
      cowsIllness: year.animals.filter(animal => animal.status = 'diseased' && animal.cause === 'illness' && animal.gender === 'female' && moment().add(year.year, 'year').isSame(animal.dateOfDeath, 'year') ),
      bullsIllness: year.animals.filter(animal => animal.status = 'diseased' && animal.cause === 'illness' && animal.gender === 'male' && moment().add(year.year, 'year').isSame(animal.dateOfDeath, 'year') ),
      newBorns: year.animals.filter(animal => animal.status = 'alive' && moment().add(year.year, 'year').isSame(animal.birthDate, 'year') ),
      newBornsDied: year.animals.filter(animal => animal.status = 'diseased' && animal.cause === 'calving-death' && moment().add(year.year, 'year').isSame(animal.dateOfDeath, 'year') ),
    })
  }); */

  return years;
}