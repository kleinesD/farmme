import $ from 'jquery';
import axios from 'axios';
import { getUser } from './authHandler';
import { getAnimalByNumber } from './animalHandler';

let pages = [
    // GENERAL PAGES
    {
        title: 'Главная страница',
        link: '/',
        module: 'none',
        toAdd: false,
        tags: 'главная дом',
        restrictions: '',
        icon: 'page.png',
        forAnimal: false
    },
    {
        title: 'Расписание',
        link: '/calendar',
        module: 'none',
        toAdd: false,
        tags: 'календарь расписание дела задачи напоминание уведомление',
        restrictions: '',
        icon: 'page.png',
        forAnimal: false
    },
    {
        title: 'Добавить напоминание',
        link: '/add-reminder',
        module: 'none',
        toAdd: true,
        tags: 'календарь расписание дела задачи напоминание уведомление',
        restrictions: '',
        icon: 'page.png',
        forAnimal: false
    },
    {
        title: 'Настройки фермы',
        link: '/edit-farm',
        module: 'none',
        toAdd: true,
        tags: 'ферма настройки',
        restrictions: 'owner',
        icon: 'page.png',
        forAnimal: false
    },
    /* {
        title: 'Все работники',
        link: '/edit-farm',
        module: 'none',
        toAdd: true,
        tags: 'ферма настройки',
        restrictions: 'owner',
        icon: 'page.png',
        forAnimal: false
    }, */
    // HERD PAGES
    {
        title: 'Животные главная',
        link: '/herd',
        module: 'herd',
        toAdd: false,
        tags: 'животные главная блок модуль страница',
        restrictions: '',
        icon: 'page.png',
        forAnimal: false
    },
    {
        title: 'Добавить животное',
        link: '/herd/add-animal',
        module: 'herd',
        toAdd: true,
        tags: 'добавить животное',
        restrictions: '',
        icon: 'page.png',
        forAnimal: false
    },
    {
        title: 'Добавить результат доения: #<id>',
        link: '/herd/add-milking-result/<id>',
        module: 'herd',
        toAdd: true,
        tags: 'добавить результат доение номер',
        restrictions: 'milking',
        icon: 'page.png',
        forAnimal: true
    },
    {
        title: 'Добавить взвешивание: #<id>',
        link: '/herd/add-weight-result/<id>',
        module: 'herd',
        toAdd: true,
        tags: 'добавить результат взвешивание номер',
        restrictions: '',
        icon: 'page.png',
        forAnimal: true
    },
    {
        title: 'Добавить осеменение: #<id>',
        link: '/herd/add-insemination/<id>',
        module: 'herd',
        toAdd: true,
        tags: 'добавить осеменение номер',
        restrictions: '',
        icon: 'page.png',
        forAnimal: true
    },
    {
        title: 'Добавить лактацию: #<id>',
        link: '/herd/add-lactation/<id>',
        module: 'herd',
        toAdd: true,
        tags: 'добавить лактацию номер',
        restrictions: '',
        icon: 'page.png',
        forAnimal: true
    },
    {
        title: 'Карта животного: #<id>',
        link: '/herd/animal-card/<id>',
        module: 'herd',
        toAdd: false,
        tags: 'карта страница животного номер',
        restrictions: '',
        icon: 'page.png',
        forAnimal: true
    },
    {
        title: 'Все животные',
        link: '/herd/all-animals/',
        module: 'herd',
        toAdd: false,
        tags: 'все животные список',
        restrictions: '',
        icon: 'page.png',
        forAnimal: false
    },
    {
        title: 'История изменений',
        link: '/herd/history/',
        module: 'herd',
        toAdd: false,
        tags: 'животные история',
        restrictions: '',
        icon: 'page.png',
        forAnimal: false
    },
    {
        title: 'Списать животное: #<id>',
        link: '/herd/write-off-animal/<id>',
        module: 'herd',
        toAdd: true,
        tags: 'списать животное номер',
        restrictions: '',
        icon: 'page.png',
        forAnimal: true
    },
    {
        title: 'Добавить осеменения | Cписок',
        link: '/herd/list-inseminations',
        module: 'herd',
        toAdd: true,
        tags: 'все животные осеменение',
        restrictions: '',
        icon: 'page.png',
        forAnimal: false
    },
    {
        title: 'Добавить результаты доения | Cписок',
        link: '/herd/list-milking-results',
        module: 'herd',
        toAdd: true,
        tags: 'все животные результат доения',
        restrictions: '',
        icon: 'page.png',
        forAnimal: false
    },
    // VET PAGES
    {
        title: 'Добавить вет. действие: #<id>',
        link: '/vet/add-action/<id>',
        module: 'vet',
        toAdd: true,
        tags: 'добавить ветеринарное действие номер',
        restrictions: '',
        icon: 'page.png',
        forAnimal: true
    },
    {
        title: 'Добавить вет. проблему: #<id>',
        link: '/vet/add-problem/<id>',
        module: 'vet',
        toAdd: true,
        tags: 'добавить ветеринарное проблему номер',
        restrictions: '',
        icon: 'page.png',
        forAnimal: true
    },
    {
        title: 'Начать схему: #<id>',
        link: '/vet/start-scheme/<id>',
        module: 'vet',
        toAdd: true,
        tags: 'начать ветеринарное схему номер',
        restrictions: '',
        icon: 'page.png',
        forAnimal: true
    },
    {
        title: 'Добавить схему',
        link: '/vet/add-scheme',
        module: 'vet',
        toAdd: true,
        tags: 'добавить ветеринарное схему',
        restrictions: '',
        icon: 'page.png',
        forAnimal: false
    },
    {
        title: 'Ветеринария главная',
        link: '/vet',
        module: 'vet',
        toAdd: false,
        tags: 'ветеринария главная страница блок модуль',
        restrictions: '',
        icon: 'page.png',
        forAnimal: false
    },
    {
        title: 'История изменений',
        link: '/vet/history',
        module: 'herd',
        toAdd: false,
        tags: 'ветеринария история',
        restrictions: '',
        icon: 'page.png',
        forAnimal: false
    },
    // WAREHOUSE PAGES
    {
        title: 'Добавить инвентарь',
        link: '/warehouse/add-inventory/',
        module: 'warehouse',
        toAdd: true,
        tags: 'добавить инвентарь склад',
        restrictions: '',
        icon: 'page.png',
        forAnimal: false
    },
    // DISTRIBUTION PAGES
    {
        title: 'Добавить клиента',
        link: '/distribution/add-client',
        module: 'distribution',
        toAdd: true,
        tags: 'добавить клиента продукция',
        restrictions: '',
        icon: 'page.png',
        forAnimal: false
    },
    {
        title: 'Добавить продукт',
        link: '/distribution/add-product-decide',
        module: 'distribution',
        toAdd: true,
        tags: 'добавить продукт продукция',
        restrictions: '',
        icon: 'page.png',
        forAnimal: false
    },
    {
        title: 'Добавить заказ',
        link: '/distribution/add-order',
        module: 'distribution',
        toAdd: true,
        tags: 'добавить заказ напоминание продукция',
        restrictions: '',
        icon: 'page.png',
        forAnimal: false
    },
    {
        title: 'Добавить продажу',
        link: '/distribution/add-sale',
        module: 'distribution',
        toAdd: true,
        tags: 'добавить продажу продукция',
        restrictions: '',
        icon: 'page.png',
        forAnimal: false
    },
    {
        title: 'Добавить использование',
        link: '/distribution/add-consumption',
        module: 'distribution',
        toAdd: true,
        tags: 'добавить использование продукция',
        restrictions: '',
        icon: 'page.png',
        forAnimal: false
    },
    {
        title: 'Все продукты',
        link: '/distribution/all-products',
        module: 'distribution',
        toAdd: false,
        tags: 'все продукты список',
        restrictions: '',
        icon: 'page.png',
        forAnimal: false
    },
    {
        title: 'Все клиенты',
        link: '/distribution/all-clients',
        module: 'distribution',
        toAdd: false,
        tags: 'все клиенты список',
        restrictions: '',
        icon: 'page.png',
        forAnimal: false
    },
    {
        title: 'Продукция главная',
        link: '/distribution',
        module: 'distribution',
        toAdd: false,
        tags: 'Продукция главная блок модуль страница',
        restrictions: '',
        icon: 'page.png',
        forAnimal: false
    },
]

export const searchEngine = async (userId) => {
    const user = await getUser(userId);

    $('#search-text').on('keyup change', async function () {
        let search = $(this).val()

        $('.main-search-found-block').empty();
        $('.main-search-found-block').show();
        if (search.length === 0) {
            $('.main-search-found-block').append(`
                <div class="ms-found-item ms-found-item-empty"> 
                    <div class="ms-found-item-image">
                        <ion-icon name="search"></ion-icon>
                    </div>
                    <div class="ms-found-item-text">
                        <div class="ms-found-item-title">Напишите что-нибудь)</div>
                    </div>
                </div>
            `);
            return;
        }

        let forAnimal = false;
        let animal;

        if (/\d/.test(search)) {
            let number = search.replace(/\D+/g, '')
            animal = await getAnimalByNumber(parseFloat(number))
            if (animal) forAnimal = true;
        }

        let matches = [];

        pages.forEach(page => {
            let matchIndex = 0;
            search.split(' ').forEach(word => {
                if (page.tags.includes(word.toLowerCase())) matchIndex++;
            });

            if (!forAnimal && page.forAnimal) return;

            if (page.module !== 'none' && !user.accessBlocks.includes(page.module)) return;

            if (page.toAdd && !user.editData) return;

            if (page.restrictions.includes('milking') && animal.lactations.length === 0) return;

            if (matchIndex > 0) matches.push({ matchIndex, page })
        });

        matches.sort((a, b) => b.matchIndex - a.matchIndex);

        if (matches.length === 0) {
            $('.main-search-found-block').append(`
                <div class="ms-found-item ms-found-item-empty"> 
                    <div class="ms-found-item-image">
                        <ion-icon name="search"></ion-icon>
                    </div>
                    <div class="ms-found-item-text">
                        <div class="ms-found-item-title">Ничего не нашлось(</div>
                    </div>
                </div>
            `);
        } else {
            matches.forEach(match => {
                let title = match.page.forAnimal ? match.page.title.replace('<id>', animal.number) : match.page.title; 
                let link = match.page.forAnimal ? match.page.link.replace('<id>', animal._id) : match.page.link; 
                $('.main-search-found-block').append(`
                    <a class="ms-found-item" href="${link}"> 
                        <div class="ms-found-item-image">
                            <ion-icon name="tablet-portrait-outline"></ion-icon>
                        </div>
                        <div class="ms-found-item-text">
                            <div class="ms-found-item-title" >${title}</div>
                        </div>
                    </a>
            `);
            });
        }

    });

    $('.main-search-line-box').on('mouseenter', function() {
        $(this).css('opacity', 1);
    });

    $('.msl-close').on('click', function() {
        $('.main-search-line-box').css('opacity', 0);
        $('.main-search-found-block').hide();
        $('#search-text').val('');
    })


    $('#search-text').trigger('change');
    $('.msl-close').trigger('click');
};