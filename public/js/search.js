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
        icon: 'home-s.svg',
        forAnimal: false
    },
    /* {
        title: 'Календарь',
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
    }, */
    {
        title: 'Настройки фермы',
        link: '/edit-farm',
        module: 'none',
        toAdd: true,
        tags: 'ферма настройки',
        restrictions: 'owner',
        icon: 'settings-s.svg',
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
        icon: 'herd-s.svg',
        forAnimal: false
    },
    {
        title: 'Добавить животное',
        link: '/herd/add-animal',
        module: 'herd',
        toAdd: true,
        tags: 'добавить животное',
        restrictions: '',
        icon: 'herd-s.svg',
        forAnimal: false
    },
    {
        title: 'Добавить результат доения: #<id>',
        link: '/herd/add-milking-result/<id>',
        module: 'herd',
        toAdd: true,
        tags: 'добавить результат доение номер',
        restrictions: 'milking',
        icon: 'herd-s.svg',
        forAnimal: true
    },
    {
        title: 'Добавить взвешивание: #<id>',
        link: '/herd/add-weight-result/<id>',
        module: 'herd',
        toAdd: true,
        tags: 'добавить результат взвешивание номер',
        restrictions: '',
        icon: 'herd-s.svg',
        forAnimal: true
    },
    {
        title: 'Добавить осеменение: #<id>',
        link: '/herd/add-insemination/<id>',
        module: 'herd',
        toAdd: true,
        tags: 'добавить осеменение номер',
        restrictions: '',
        icon: 'herd-s.svg',
        forAnimal: true
    },
    {
        title: 'Добавить лактацию: #<id>',
        link: '/herd/add-lactation/<id>',
        module: 'herd',
        toAdd: true,
        tags: 'добавить лактацию номер',
        restrictions: '',
        icon: 'herd-s.svg',
        forAnimal: true
    },
    {
        title: 'Карта животного: #<id>',
        link: '/herd/animal-card/<id>',
        module: 'herd',
        toAdd: false,
        tags: 'карта страница животного номер',
        restrictions: '',
        icon: 'herd-s.svg',
        forAnimal: true
    },
    {
        title: 'Все животные',
        link: '/herd/all-animals/',
        module: 'herd',
        toAdd: false,
        tags: 'все животные список',
        restrictions: '',
        icon: 'herd-s.svg',
        forAnimal: false
    },
    /* {
        title: 'История изменений',
        link: '/herd/history/',
        module: 'herd',
        toAdd: false,
        tags: 'животные история',
        restrictions: '',
        icon: 'herd-s.svg',
        forAnimal: false
    }, */
    {
        title: 'Списать животное: #<id>',
        link: '/herd/write-off-animal/<id>',
        module: 'herd',
        toAdd: true,
        tags: 'списать животное номер',
        restrictions: '',
        icon: 'herd-s.svg',
        forAnimal: true
    },
    {
        title: 'Добавить осеменения | Cписок',
        link: '/herd/list-inseminations',
        module: 'herd',
        toAdd: true,
        tags: 'все животные осеменение',
        restrictions: '',
        icon: 'list-s.svg',
        forAnimal: false
    },
    {
        title: 'Добавить результаты доения | Cписок',
        link: '/herd/list-milking-results',
        module: 'herd',
        toAdd: true,
        tags: 'все животные результат доения',
        restrictions: '',
        icon: 'list-s.svg',
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
        icon: 'vet-s.svg',
        forAnimal: true
    },
    {
        title: 'Добавить вет. проблему: #<id>',
        link: '/vet/add-problem/<id>',
        module: 'vet',
        toAdd: true,
        tags: 'добавить ветеринарное проблему номер',
        restrictions: '',
        icon: 'vet-s.svg',
        forAnimal: true
    },
    {
        title: 'Начать схему: #<id>',
        link: '/vet/start-scheme/<id>',
        module: 'vet',
        toAdd: true,
        tags: 'начать ветеринарное схему номер',
        restrictions: '',
        icon: 'vet-s.svg',
        forAnimal: true
    },
    {
        title: 'Добавить схему',
        link: '/vet/add-scheme',
        module: 'vet',
        toAdd: true,
        tags: 'добавить ветеринарное схему',
        restrictions: '',
        icon: 'vet-s.svg',
        forAnimal: false
    },
    {
        title: 'Ветеринария главная',
        link: '/vet',
        module: 'vet',
        toAdd: false,
        tags: 'ветеринария главная страница блок модуль',
        restrictions: '',
        icon: 'vet-s.svg',
        forAnimal: false
    },
    /* {
        title: 'История изменений',
        link: '/vet/history',
        module: 'herd',
        toAdd: false,
        tags: 'ветеринария история',
        restrictions: '',
        icon: 'vet-s.svg',
        forAnimal: false
    }, */
    // WAREHOUSE PAGES
    /* {
        title: 'Добавить инвентарь',
        link: '/warehouse/add-inventory/',
        module: 'warehouse',
        toAdd: true,
        tags: 'добавить инвентарь склад',
        restrictions: '',
        icon: 'page.png',
        forAnimal: false
    }, */
    // DISTRIBUTION PAGES
    {
        title: 'Добавить клиента',
        link: '/distribution/add-client',
        module: 'distribution',
        toAdd: true,
        tags: 'добавить клиента продукция',
        restrictions: '',
        icon: 'dist-s.svg',
        forAnimal: false
    },
    {
        title: 'Добавить продукт',
        link: '/distribution/add-product-decide',
        module: 'distribution',
        toAdd: true,
        tags: 'добавить продукт продукция',
        restrictions: '',
        icon: 'dist-s.svg',
        forAnimal: false
    },
    /* {
        title: 'Добавить заказ',
        link: '/distribution/add-order',
        module: 'distribution',
        toAdd: true,
        tags: 'добавить заказ напоминание продукция',
        restrictions: '',
        icon: 'dist-s.svg',
        forAnimal: false
    }, */
    {
        title: 'Добавить продажу',
        link: '/distribution/add-sale',
        module: 'distribution',
        toAdd: true,
        tags: 'добавить продажу продукция',
        restrictions: '',
        icon: 'dist-s.svg',
        forAnimal: false
    },
    {
        title: 'Добавить использование',
        link: '/distribution/add-consumption',
        module: 'distribution',
        toAdd: true,
        tags: 'добавить использование продукция',
        restrictions: '',
        icon: 'dist-s.svg',
        forAnimal: false
    },
    {
        title: 'Все продукты',
        link: '/distribution/all-products',
        module: 'distribution',
        toAdd: false,
        tags: 'все продукты список',
        restrictions: '',
        icon: 'dist-s.svg',
        forAnimal: false
    },
    {
        title: 'Все клиенты',
        link: '/distribution/all-clients',
        module: 'distribution',
        toAdd: false,
        tags: 'все клиенты список',
        restrictions: '',
        icon: 'dist-s.svg',
        forAnimal: false
    },
    {
        title: 'Продукция главная',
        link: '/distribution',
        module: 'distribution',
        toAdd: false,
        tags: 'Продукция главная блок модуль страница',
        restrictions: '',
        icon: 'dist-s.svg',
        forAnimal: false
    },
    // FEED PAGES
    {
        title: 'Кормление главная',
        link: '/feed',
        module: 'feed',
        toAdd: false,
        tags: 'Кормление главная блок модуль страница',
        restrictions: '',
        icon: 'feed-s.svg',
        forAnimal: false
    },
    {
        title: 'Добавить вид корма',
        link: '/feed/sample/add',
        module: 'feed',
        toAdd: true,
        tags: 'добавить вид корм',
        restrictions: '',
        icon: 'feed-s.svg',
        forAnimal: false
    },
    {
        title: 'Добавить запись корма',
        link: '/feed/record/add',
        module: 'feed',
        toAdd: true,
        tags: 'добавить запись корм расход',
        restrictions: '',
        icon: 'feed-s.svg',
        forAnimal: false
    },
    // MILK QUALITY PAGES
    {
        title: 'Добавить качество молока',
        link: '/milk-quality/add',
        module: 'herd',
        toAdd: true,
        tags: 'добавить качествот молока',
        restrictions: '',
        icon: 'milk-quality-s.svg',
        forAnimal: false
    },
]

export const searchEngine = async (userId) => {
    const user = await getUser(userId);

    let prevMatches = [];
    $('#search-text').on('keyup change', async function () {
        $('.ms-loader').css('opacity', '1');
        let search = $(this).val()

        
        if (search.length === 0)  {
            $('.ms-loader').css('opacity', '0');
            $('.main-search-found-block').empty();

            return;
        }

        let forAnimal = false;
        let animal;

        search.split(' ').forEach(async word => {
            if (word.startsWith('#')) {
                animal = await getAnimalByNumber(word.replace('#', ''))
                if (animal) forAnimal = true;
            }
        });

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

            if (forAnimal && page.forAnimal && page.title.startsWith('Карта животного')) matchIndex++;

            if (matchIndex > 0) matches.push({ matchIndex, page })
        });

        $('.ms-loader').css('opacity', '0');

        matches.sort((a, b) => b.matchIndex - a.matchIndex);

        if(JSON.stringify(matches) === JSON.stringify(prevMatches)) return;
        
        prevMatches = matches;
        $('.main-search-found-block').empty();

        if (matches.length === 0) {
            $('.main-search-found-block').append(`
                <div class="ms-found-item ms-found-item-empty"> 
                    <div class="ms-found-item-image">
                        <ion-icon name="search"></ion-icon>
                    </div>
                    <div class="ms-found-item-text">
                        <div class="ms-found-item-title">Ничего не нашлось</div>
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
                            <img src="/img/icons/${match.page.icon}">
                        </div>
                        <div class="ms-found-item-text">
                            <div class="ms-found-item-title" >${title}</div>
                        </div>
                    </a>
            `);
            });

            $('.ms-found-item').first().addClass('ms-found-item-selected');
        }

    });

     $('#search-text').trigger('change');


     

     $('body').on('keydown', function(e) {
        /* Toggling search visibility on key combination pressed */
        if ( e.ctrlKey && ( e.which === 83 ) ) {
            if($('.main-search-block').css('display') === 'none') {
                $('.main-search-block').css('display', 'flex');
                $('#search-text').trigger('focus');
            } else {
                $('.main-search-block').css('display', 'none');
            }
        }

        if($('.main-search-block').css('display') === 'flex') {
            /* Moving among the items */
            if(e.which === 40 && $('.ms-found-item-selected').next().length > 0) {
                $('.ms-found-item-selected').removeClass('ms-found-item-selected').next().addClass('ms-found-item-selected');
            }
            if(e.which === 38 && $('.ms-found-item-selected').prev().length > 0) {
                $('.ms-found-item-selected').removeClass('ms-found-item-selected').prev().addClass('ms-found-item-selected');
            }

            /* Doing an action on enter click */
            if(e.which === 13) {
                location.assign($('.ms-found-item-selected').attr('href'));
            }
        }

     });
};