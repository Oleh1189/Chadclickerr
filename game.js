let userAccount = null;
let score = localStorage.getItem('score') ? parseInt(localStorage.getItem('score')) : 0;
let clickPower = localStorage.getItem('clickPower') ? parseInt(localStorage.getItem('clickPower')) : 1;
let currentSkin = localStorage.getItem('currentSkin') || 'your-image.png';

const upgrades = {
    9000: 3,
    50000: 9,
    100000: 15,
    250000: 23,
    400000: 43,
    1000000: 101,
    1500000: 148,
    3000000: 500,
    4000000: 614,
    5000000: 777,
    7777777: 1487,
    1000000000: 2999
};

// Получаем состояние улучшений и скинов из localStorage
const boughtUpgrades = JSON.parse(localStorage.getItem('boughtUpgrades')) || {};
const boughtSkins = JSON.parse(localStorage.getItem('boughtSkins')) || {};
let selectedSkin = localStorage.getItem('selectedSkin') || currentSkin;

const scoreElement = document.getElementById('score');
const clickableImage = document.getElementById('clickable-image');
clickableImage.src = selectedSkin;

const errorMessageElement = document.getElementById('error-message');
const promoButton = document.getElementById('promo-button');
const promoModal = document.getElementById('promo-modal');
const closeModal = document.querySelector('.promo-modal-content .close');
const promoCodeInput = document.getElementById('promo-code');
const activatePromoButton = document.getElementById('activate-promo');
const promoMessageElement = document.getElementById('promo-message');
const resetButton = document.getElementById('reset-button');
const resetModal = document.getElementById('reset-modal');
const closeResetModal = document.querySelector('.reset-modal-content .close-reset');
const confirmResetButton = document.getElementById('confirm-reset');
const cancelResetButton = document.getElementById('cancel-reset');

// Для магазина
const shopButton = document.getElementById('shop-button');
const shopModal = document.getElementById('shop-modal');
const closeShopModal = document.querySelector('.shop-modal-content .close-shop');

// Устанавливаем начальные значения
scoreElement.textContent = score;

function initializeUpgradeButtons() {
    document.querySelectorAll('#upgrade-info button').forEach((button, index) => {
        const cost = Object.keys(upgrades)[index];
        if (boughtUpgrades[cost]) {
            button.disabled = true; // Блокируем купленные улучшения
        } else if (index > 0 && !boughtUpgrades[Object.keys(upgrades)[index - 1]]) {
            button.disabled = true; // Блокируем улучшения, пока предыдущее не куплено
        } else {
            button.disabled = false; // Разблокируем доступные улучшения
        }
    });
}

// Запускаем начальную инициализацию кнопок
initializeUpgradeButtons();

clickableImage.addEventListener('click', (event) => {
    score += clickPower;
    scoreElement.textContent = score;
    localStorage.setItem('score', score);
    showUpgradeAnimation(event);
});

function showUpgradeAnimation(event) {
    const upgradeAnimation = document.createElement('div');
    upgradeAnimation.className = 'upgrade-animation';
    upgradeAnimation.innerText = `+${clickPower}`;
    document.body.appendChild(upgradeAnimation);
    upgradeAnimation.style.left = `${event.clientX}px`;
    upgradeAnimation.style.top = `${event.clientY}px`;

    setTimeout(() => {
        upgradeAnimation.remove();
    }, 1000);
}

function showError(message) {
    errorMessageElement.textContent = message;
    errorMessageElement.style.display = 'block';
    setTimeout(() => {
        errorMessageElement.style.display = 'none';
    }, 5000);
}

function checkForUpgrades() {
    initializeUpgradeButtons();
}

// Обработчики для кнопок улучшений
document.querySelectorAll('#upgrade-info button').forEach((button, index) => {
    button.addEventListener('click', () => {
        const cost = Object.keys(upgrades)[index];
        if (score >= cost) {
            score -= cost;
            clickPower = upgrades[cost];
            boughtUpgrades[cost] = true;
            localStorage.setItem('score', score);
            localStorage.setItem('clickPower', clickPower);
            localStorage.setItem('boughtUpgrades', JSON.stringify(boughtUpgrades));
            scoreElement.textContent = score;

            button.disabled = true;
            const nextButton = document.querySelector(`#upgrade-${index + 2}`);
            if (nextButton) {
                nextButton.disabled = false;
            }

            checkForUpgrades();
        } else {
            showError(`Недостаточно чадов. У вас ${score}. Вам нужно ${cost}`);
        }
    });
});

// Открытие и закрытие модального окна магазина
shopButton.addEventListener('click', () => {
    shopModal.style.display = 'flex';
    updateShopButtons();
});

closeShopModal.addEventListener('click', () => {
    shopModal.style.display = 'none';
});

// Покупка скинов
document.querySelectorAll('.buy-button').forEach((button) => {
    button.addEventListener('click', () => {
        const cost = parseInt(button.getAttribute('data-cost'));
        const skin = button.getAttribute('data-skin');

        // Проверяем, хватает ли денег и не куплен ли скин ранее
        if (score >= cost && !boughtSkins[skin]) {
            score -= cost;  // Уменьшаем счет только если хватает денег
            boughtSkins[skin] = true;  // Отмечаем, что скин куплен

            localStorage.setItem('score', score);
            localStorage.setItem('boughtSkins', JSON.stringify(boughtSkins));
            scoreElement.textContent = score;

            button.textContent = 'ВЫБРАТЬ'; // Меняем текст кнопки после покупки
            button.disabled = false;
        } else if (boughtSkins[skin]) {
            selectedSkin = skin;
            clickableImage.src = selectedSkin;
            localStorage.setItem('selectedSkin', selectedSkin);

            updateShopButtons(); // Обновляем кнопки в магазине
        } else {
            showError(`Недостаточно чадов. У вас ${score}. Вам нужно ${cost}`);
        }
    });
});

function updateShopButtons() {
    document.querySelectorAll('.buy-button').forEach((button) => {
        const skin = button.getAttribute('data-skin');
        if (boughtSkins[skin]) {
            if (selectedSkin === skin) {
                button.textContent = 'ВЫБРАНО';
                button.classList.add('selected-button');
            } else {
                button.textContent = 'ВЫБРАНО';
                button.classList.remove('selected-button');
            }
        }
    });
}

// Промокод
promoButton.addEventListener('click', () => {
    promoModal.style.display = 'flex';
});

closeModal.addEventListener('click', () => {
    promoModal.style.display = 'none';
});

activatePromoButton.addEventListener('click', () => {
    const promoCode = promoCodeInput.value.trim();
    const isPromoCodeUsed = localStorage.getItem('promoCodeUsed') === 'true';

    if (promoCode === '') {
        promoMessageElement.textContent = 'Промокод не введен. Попробуйте еще раз.';
        showPromoMessage(promoMessageElement.textContent);
    } else if (promoCode === 'Пупс') {
        if (!isPromoCodeUsed) {
            localStorage.setItem('promoCodeUsed', 'true');
promoMessageElement.style.color = 'green'; // Устанавливаем зеленый цвет
            showPromoMessage('Промокод успешно активирован ждите приз!');
            setTimeout(() => {
                score += 10000;
                scoreElement.textContent = score;
                localStorage.setItem('score', score);
                checkForUpgrades();
            }, 20000);
        } else {
promoMessageElement.textContent = 'Этот промокод уже был использован';
            showPromoMessage(promoMessageElement.textContent);
        }
    } else {
        promoMessageElement.textContent = 'Неверный промокод. Попробуйте еще раз.';
        showPromoMessage(promoMessageElement.textContent);
    }
    promoModal.style.display = 'none';
});

function showPromoMessage(message) {
    promoMessageElement.textContent = message;
    promoMessageElement.style.display = 'block';
    setTimeout(() => {
        promoMessageElement.style.display = 'none';
    }, 5000);
}

// Сброс игры
resetButton.addEventListener('click', () => {
    resetModal.style.display = 'flex';
});

closeResetModal.addEventListener('click', () => {
    resetModal.style.display = 'none';
});

confirmResetButton.addEventListener('click', () => {
    score = 0;
    clickPower = 1;
    selectedSkin = 'your-image.png';
    localStorage.setItem('score', score);
    localStorage.setItem('clickPower', clickPower);
    localStorage.removeItem('boughtUpgrades');
    localStorage.removeItem('boughtSkins');
    localStorage.removeItem('promoCodeUsed');
    localStorage.setItem('selectedSkin', selectedSkin);
    clickableImage.src = selectedSkin;
    scoreElement.textContent = score;
    resetModal.style.display = 'none';
    checkForUpgrades();
    updateShopButtons();
});

cancelResetButton.addEventListener('click', () => {
    resetModal.style.display = 'none';
});

function handleCredentialResponse(response) {
    const data = jwt_decode(response.credential); // Расшифровка JWT
    userAccount = {
        name: data.name,
        email: data.email,
        picture: data.picture
    };

    // Скрыть экран авторизации и отобразить игру
    document.getElementById("auth-screen").classList.add("hidden");

    // Приветствие
    alert(`Добро пожаловать, ${userAccount.name}!`);
    console.log("Пользователь вошел:", userAccount);
}

// Инициализация Google API
function initializeGoogleSignIn() {
    google.accounts.id.initialize({
        client_id: "1039116906672-38kai78avabut11k5vvi6h6gn9mu9oa5.apps.googleusercontent.com",
        callback: handleCredentialResponse
    });
    google.accounts.id.renderButton(
        document.querySelector(".g_id_signin"),
        { theme: "outline", size: "large" }
    );
}

// Выход из аккаунта
function logout() {
    google.accounts.id.disableAutoSelect(); // Убирает автологин
    userAccount = null;
    document.getElementById("auth-screen").classList.remove("hidden");
    alert("Вы вышли из аккаунта.");
}

// Запуск и инициализация
window.onload = function () {
    initializeGoogleSignIn();
};
