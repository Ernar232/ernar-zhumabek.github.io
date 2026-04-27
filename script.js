// ===== script.js =====
(function () {
    "use strict";

    // ----- DOM элементтері -----
    const checkboxes = document.querySelectorAll('.dish-checkbox');
    const totalSpan = document.getElementById('totalAmount');
    const customerNameInput = document.getElementById('customerName');
    const placeOrderBtn = document.getElementById('placeOrderBtn');
    const successDiv = document.getElementById('orderSuccess');
    const viewMenuBtn = document.getElementById('viewMenuBtn');
    const menuSection = document.getElementById('menu');

    // Auth модалдары
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const loginModal = document.getElementById('loginModalOverlay');
    const registerModal = document.getElementById('registerModalOverlay');
    const closeLoginBtn = document.getElementById('closeLoginModalBtn');
    const closeRegisterBtn = document.getElementById('closeRegisterModalBtn');
    const switchToRegister = document.getElementById('switchToRegister');
    const switchToLogin = document.getElementById('switchToLogin');

    // Формалар
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const loginError = document.getElementById('loginError');
    const registerError = document.getElementById('registerError');
    const registerSuccess = document.getElementById('registerSuccess');

    // ----- 1. Жалпы соманы есептеу -----
    function calculateTotal() {
        let total = 0;
        checkboxes.forEach(cb => {
            if (cb.checked) {
                total += parseInt(cb.value, 10);
            }
        });
        totalSpan.textContent = total;
        return total;
    }

    checkboxes.forEach(cb => {
        cb.addEventListener('change', calculateTotal);
    });
    calculateTotal();

    // ----- 2. "Мәзірді көру" батырмасы -----
    viewMenuBtn.addEventListener('click', () => {
        menuSection.scrollIntoView({ behavior: 'smooth' });
    });

    // ----- 3. Тапсырыс беру -----
    placeOrderBtn.addEventListener('click', () => {
        const name = customerNameInput.value.trim();
        const total = parseInt(totalSpan.textContent, 10);
        const anyChecked = Array.from(checkboxes).some(cb => cb.checked);

        if (!name) {
            alert('Аты-жөніңізді енгізіңіз.');
            return;
        }
        if (!anyChecked) {
            alert('Кем дегенде бір тағам таңдаңыз.');
            return;
        }

        successDiv.style.display = 'block';
        successDiv.textContent = `Сәлеметсіз бе, ${name}! Сіздің тапсырысыңыз қабылданды. Барлығы: ${total} ₸. Тапсырысыңыз 20 минутта дайын болады.`;
    });

    customerNameInput.addEventListener('input', () => {
        successDiv.style.display = 'none';
    });

    checkboxes.forEach(cb => {
        cb.addEventListener('change', () => {
            successDiv.style.display = 'none';
        });
    });

    // ----- 4. ҚҰРДЕЛІ АВТОРИЗАЦИЯ ЖҮЙЕСІ -----

    // Модалдарды ашу/жабу
    function openModal(modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    function closeModal(modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
        // қателерді тазалау
        if (modal === loginModal) {
            loginError.style.display = 'none';
            document.getElementById('loginPassword').classList.remove('error');
        } else {
            registerError.style.display = 'none';
            registerSuccess.style.display = 'none';
            document.querySelectorAll('#registerForm input').forEach(input => {
                input.classList.remove('error');
            });
        }
    }

    loginBtn.addEventListener('click', () => openModal(loginModal));
    registerBtn.addEventListener('click', () => openModal(registerModal));

    closeLoginBtn.addEventListener('click', () => closeModal(loginModal));
    closeRegisterBtn.addEventListener('click', () => closeModal(registerModal));

    // Модал арасында ауысу
    switchToRegister.addEventListener('click', () => {
        closeModal(loginModal);
        openModal(registerModal);
    });

    switchToLogin.addEventListener('click', () => {
        closeModal(registerModal);
        openModal(loginModal);
    });

    // Сыртын басқанда жабу
    window.addEventListener('click', (e) => {
        if (e.target === loginModal) closeModal(loginModal);
        if (e.target === registerModal) closeModal(registerModal);
    });

    // Esc пернесі
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (loginModal.classList.contains('show')) closeModal(loginModal);
            if (registerModal.classList.contains('show')) closeModal(registerModal);
        }
    });

    // ----- ҚҰПИЯ СӨЗДІ ТЕКСЕРУ ФУНКЦИЯЛАРЫ -----

    // 1. Бас әріп бар ма?
    function hasUppercase(str) {
        return /[A-Z]/.test(str);
    }

    // 2. Кемінде бір сан бар ма?
    function hasNumber(str) {
        return /\d/.test(str);
    }

    // 3. Ұзындығы кемінде 8 символ
    function isLongEnough(str) {
        return str.length >= 8;
    }

    // 4. Құпия сөзді тексеру (кіру үшін)
    function validateLoginPassword(password) {
        const errors = [];
        if (!hasUppercase(password)) {
            errors.push('Құпия сөзде кемінде 1 бас әріп болуы керек');
        }
        if (password.length < 3) { // минималды ұзындық
            errors.push('Құпия сөз тым қысқа');
        }
        return errors;
    }

    // 5. Құпия сөзді тексеру (тіркелу үшін)
    function validateRegisterPassword(password) {
        const errors = [];
        if (!isLongEnough(password)) {
            errors.push('Құпия сөз кемінде 8 символ болуы керек');
        }
        if (!hasUppercase(password)) {
            errors.push('Құпия сөзде кемінде 1 бас әріп болуы керек');
        }
        if (!hasNumber(password)) {
            errors.push('Құпия сөзде кемінде 1 сан болуы керек');
        }
        return errors;
    }

    // ----- КІРУ ФОРМАСЫН ӨҢДЕУ -----
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        const passwordInput = document.getElementById('loginPassword');

        // Қателерді тазалау
        loginError.style.display = 'none';
        passwordInput.classList.remove('error');

        // Email тексеру
        if (!email) {
            showLoginError('Email енгізіңіз');
            return;
        }

        if (!email.includes('@') || !email.includes('.')) {
            showLoginError('Жарамды email енгізіңіз');
            return;
        }

        // Құпия сөзді тексеру
        const passwordErrors = validateLoginPassword(password);

        if (passwordErrors.length > 0) {
            passwordInput.classList.add('error');
            showLoginError(passwordErrors[0]); // бірінші қатені көрсету
            return;
        }

        // Егер бәрі дұрыс болса
        loginSuccess(email.split('@')[0]);
    });

    function showLoginError(message) {
        loginError.textContent = message;
        loginError.style.display = 'block';
    }

    function loginSuccess(username) {
        // Кіру сәтті болғанда
        alert(`Қош келдіңіз, ${username}!`);
        closeModal(loginModal);

        // Навигацияны жаңарту (қосымша)
        updateNavigationAfterLogin(username);
    }

    // ----- ТІРКЕЛУ ФОРМАСЫН ӨҢДЕУ -----
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('registerName').value.trim();
        const email = document.getElementById('registerEmail').value.trim();
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Барлық инпуттардан error классын алу
        document.querySelectorAll('#registerForm input').forEach(input => {
            input.classList.remove('error');
        });

        registerError.style.display = 'none';
        registerSuccess.style.display = 'none';

        // Аты-жөнін тексеру
        if (!name) {
            showRegisterError('Аты-жөніңізді енгізіңіз');
            document.getElementById('registerName').classList.add('error');
            return;
        }

        if (name.length < 2) {
            showRegisterError('Аты-жөні кемінде 2 символ болуы керек');
            document.getElementById('registerName').classList.add('error');
            return;
        }

        // Email тексеру
        if (!email) {
            showRegisterError('Email енгізіңіз');
            document.getElementById('registerEmail').classList.add('error');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showRegisterError('Жарамды email енгізіңіз');
            document.getElementById('registerEmail').classList.add('error');
            return;
        }

        // Құпия сөзді тексеру
        const passwordErrors = validateRegisterPassword(password);

        if (passwordErrors.length > 0) {
            showRegisterError(passwordErrors[0]);
            document.getElementById('registerPassword').classList.add('error');
            return;
        }

        // Құпия сөздің сәйкестігін тексеру
        if (password !== confirmPassword) {
            showRegisterError('Құпия сөздер сәйкес келмейді');
            document.getElementById('confirmPassword').classList.add('error');
            document.getElementById('registerPassword').classList.add('error');
            return;
        }

        // Егер бәрі дұрыс болса
        registerSuccess.textContent = `${name}, тіркелу сәтті аяқталды! Енді кіре аласыз.`;
        registerSuccess.style.display = 'block';

        // Форманы тазалау
        registerForm.reset();

        // 2 секундтан кейін кіру модалына ауысу
        setTimeout(() => {
            closeModal(registerModal);
            openModal(loginModal);
        }, 2000);
    });

    function showRegisterError(message) {
        registerError.textContent = message;
        registerError.style.display = 'block';
    }

    // Навигацияны жаңарту (кіргеннен кейін)
    function updateNavigationAfterLogin(username) {
        const navLinks = document.querySelector('.nav-links');
        const authButtons = document.querySelector('.auth-buttons');

        // Уақытша қарапайым шешім
        if (authButtons) {
            authButtons.innerHTML = `
                <div class="user-info">
                    <span class="user-name">${username}</span>
                    <button class="logout-btn" id="logoutBtn">Шығу</button>
                </div>
            `;

            document.getElementById('logoutBtn').addEventListener('click', () => {
                location.reload(); // қарапайым шығу
            });
        }
    }

    // Демо режимінде тестілеу үшін мысалдар
    console.log('Құпия сөз мысалдары:');
    console.log('Дұрыс: Almaty2024');
    console.log('Қате: almaty2024 (бас әріп жоқ)');
    console.log('Қате: Almaty (сан жоқ)');
})();

// ===== script.js (жаңартылған) =====
(function () {
    "use strict";

    // ----- DOM элементтері -----
    const checkboxes = document.querySelectorAll('.dish-checkbox');
    const totalSpan = document.getElementById('totalAmount');
    const originalTotalSpan = document.getElementById('originalTotal');
    const customerNameInput = document.getElementById('customerName');
    const placeOrderBtn = document.getElementById('placeOrderBtn');
    const successDiv = document.getElementById('orderSuccess');
    const viewMenuBtn = document.getElementById('viewMenuBtn');
    const menuSection = document.getElementById('menu');

    // Жеңілдік элементтері
    const discountInput = document.getElementById('discountCodeInput');
    const applyDiscountBtn = document.getElementById('applyDiscount');
    const discountMessage = document.getElementById('discountMessage');
    const discountAmountDiv = document.getElementById('discountAmount');
    const discountValueSpan = document.getElementById('discountValue');

    // Викторина элементтері
    const quizContainer = document.getElementById('quiz-container');
    const submitQuizBtn = document.getElementById('submitQuiz');
    const resetQuizBtn = document.getElementById('resetQuiz');
    const quizResult = document.getElementById('quizResult');
    const discountCodeDiv = document.getElementById('discountCode');

    // Баға мен жеңілдік айнымалылары
    let currentDiscount = 0; // 0 = жеңілдік жоқ, 0.2 = 20%
    let activeDiscountCode = null;

    // ===== ВИКТОРИНА СҰРАҚТАРЫ =====
    const quizQuestions = [
        {
            question: "Қазақтың ұлттық тағамы қайсысы?",
            options: ["Борщ", "Бешбармақ", "Пицца", "Сүши"],
            correct: 1
        },
        {
            question: "Лагман қай елдің тағамы?",
            options: ["Орта Азия", "Италия", "Франция", "Жапония"],
            correct: 0
        },
        {
            question: "Манты неше минутта піседі?",
            options: ["10-15 мин", "25-30 мин", "40-45 мин", "1 сағат"],
            correct: 2
        },
        {
            question: "Қазақстанның ұлттық сусыны?",
            options: ["Шай", "Қымыз", "Кофе", "Сок"],
            correct: 1
        },
        {
            question: "Пловтың негізгі ингредиенті?",
            options: ["Күріш", "Макарон", "Картоп", "Гречка"],
            correct: 0
        }
    ];

    // ===== ВИКТОРИНА ИНИЦИАЛИЗАЦИЯСЫ =====
    function renderQuiz() {
        let html = '';
        quizQuestions.forEach((q, index) => {
            html += `
                <div class="question-item" id="question-${index}">
                    <div class="question-text">${index + 1}. ${q.question}</div>
                    <div class="options-group">
                        ${q.options.map((opt, optIndex) => `
                            <label class="option-label">
                                <input type="radio" name="q${index}" value="${optIndex}">
                                ${opt}
                            </label>
                        `).join('')}
                    </div>
                    <div class="question-feedback" id="feedback-${index}"></div>
                </div>
            `;
        });
        quizContainer.innerHTML = html;
    }

    // ===== ВИКТОРИНА ТЕКСЕРУ =====
    function checkQuiz() {
        let correctCount = 0;

        quizQuestions.forEach((q, index) => {
            const selected = document.querySelector(`input[name="q${index}"]:checked`);
            const questionItem = document.getElementById(`question-${index}`);
            const feedback = document.getElementById(`feedback-${index}`);

            // Ескі кластарды тазалау
            questionItem.classList.remove('correct', 'incorrect');

            if (selected) {
                const answer = parseInt(selected.value);
                if (answer === q.correct) {
                    correctCount++;
                    questionItem.classList.add('correct');
                    feedback.textContent = `✅ Дұрыс! ${q.options[q.correct]}`;
                } else {
                    questionItem.classList.add('incorrect');
                    feedback.textContent = `❌ Қате! Дұрыс жауап: ${q.options[q.correct]}`;
                }
            } else {
                questionItem.classList.add('incorrect');
                feedback.textContent = '❌ Жауап берілмеген';
            }
        });

        // Нәтижені көрсету
        quizResult.style.display = 'block';

        if (correctCount === quizQuestions.length) {
            // Барлық жауап дұрыс
            quizResult.className = 'quiz-result success';
            quizResult.textContent = `🎉 Құттықтаймыз! Сіз ${correctCount}/${quizQuestions.length} дұрыс жауап бердіңіз!`;

            // Жеңілдік кодын генерациялау
            generateDiscountCode();
        } else {
            quizResult.className = 'quiz-result failure';
            quizResult.textContent = `😢 Сіз ${correctCount}/${quizQuestions.length} дұрыс жауап бердіңіз. Қайталап көріңіз!`;
            discountCodeDiv.style.display = 'none';
        }
    }

    // ===== ЖЕҢІЛДІК КОДЫН ГЕНЕРАЦИЯЛАУ =====
    function generateDiscountCode() {
        // Код генерациясы: DALA + күн + рандом сан
        const date = new Date();
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const random = Math.floor(Math.random() * 1000);
        const code = `DALA${day}${month}${random}`.toUpperCase();

        activeDiscountCode = code;

        discountCodeDiv.innerHTML = `
            <div>🎫 Сіздің жеңілдік кодыңыз:</div>
            <div style="font-size: 2rem; letter-spacing: 5px;">${code}</div>
            <small>20% жеңілдік алу үшін кодты қолданыңыз</small>
        `;
        discountCodeDiv.style.display = 'block';
    }

    // ===== ЖЕҢІЛДІК КОДЫН ҚОЛДАНУ =====
    function applyDiscount() {
        const code = discountInput.value.trim().toUpperCase();

        if (!code) {
            showDiscountMessage('Кодты енгізіңіз', 'error');
            return;
        }

        if (code === activeDiscountCode) {
            currentDiscount = 0.2; // 20% жеңілдік
            showDiscountMessage('✅ Жеңілдік коды қабылданды! 20% жеңілдік', 'success');
            updatePriceWithDiscount();

            // Жеңілдік мәліметін көрсету
            discountAmountDiv.style.display = 'block';
        } else {
            showDiscountMessage('❌ Жарамсыз код', 'error');
            currentDiscount = 0;
            discountAmountDiv.style.display = 'none';
        }
    }

    function showDiscountMessage(msg, type) {
        discountMessage.textContent = msg;
        discountMessage.className = `discount-message ${type}`;
    }

    // ===== БАҒАНЫ ЖЕҢІЛДІКПЕН ЕСЕПТЕУ =====
    function calculateOriginalTotal() {
        let total = 0;
        checkboxes.forEach(cb => {
            if (cb.checked) {
                total += parseInt(cb.value, 10);
            }
        });
        return total;
    }

    function updatePriceWithDiscount() {
        const originalTotal = calculateOriginalTotal();
        originalTotalSpan.textContent = originalTotal;

        if (currentDiscount > 0) {
            const discountValue = Math.round(originalTotal * currentDiscount);
            const finalTotal = originalTotal - discountValue;

            discountValueSpan.textContent = discountValue;
            totalSpan.textContent = finalTotal;
            discountAmountDiv.style.display = 'block';
        } else {
            totalSpan.textContent = originalTotal;
            discountAmountDiv.style.display = 'none';
        }
    }

    // ===== ТАПСЫРЫС БЕРУ (жаңартылған) =====
    placeOrderBtn.addEventListener('click', () => {
        const name = customerNameInput.value.trim();
        const total = parseInt(totalSpan.textContent, 10);
        const originalTotal = parseInt(originalTotalSpan.textContent, 10);
        const anyChecked = Array.from(checkboxes).some(cb => cb.checked);

        if (!name) {
            alert('Аты-жөніңізді енгізіңіз.');
            return;
        }
        if (!anyChecked) {
            alert('Кем дегенде бір тағам таңдаңыз.');
            return;
        }

        let message = `Сәлеметсіз бе, ${name}! Сіздің тапсырысыңыз қабылданды. `;

        if (currentDiscount > 0) {
            const saved = originalTotal - total;
            message += `Бастапқы баға: ${originalTotal} ₸, `;
            message += `Жеңілдік: ${saved} ₸ (20%), `;
        }

        message += `Төлейтін сома: ${total} ₸. Тапсырысыңыз 20 минутта дайын болады.`;

        successDiv.style.display = 'block';
        successDiv.textContent = message;
    });

    // ===== EVENT LISTENERLER =====
    checkboxes.forEach(cb => {
        cb.addEventListener('change', updatePriceWithDiscount);
    });

    applyDiscountBtn.addEventListener('click', applyDiscount);
    submitQuizBtn.addEventListener('click', checkQuiz);

    resetQuizBtn.addEventListener('click', () => {
        // Барлық радио батырмаларды тазалау
        document.querySelectorAll('input[type="radio"]').forEach(radio => {
            radio.checked = false;
        });

        // Қате/дұрыс кластарын тазалау
        document.querySelectorAll('.question-item').forEach(item => {
            item.classList.remove('correct', 'incorrect');
        });

        // Нәтижелерді жасыру
        quizResult.style.display = 'none';
        discountCodeDiv.style.display = 'none';
        activeDiscountCode = null;
    });

    // Бастапқы render
    renderQuiz();
    updatePriceWithDiscount();

    // ===== ЕСКІ КОД (өзгеріссіз қалады) =====
    // ... (бұрынғы авторизация, модалдар және т.б. кодтар)

    // Ескерту: толық нұсқа үшін бұрынғы авторизация кодтарын да қосу керек
    // Олар өзгеріссіз қалады, сондықтан қысқарту үшін жазбадым
})();
// ===== script.js (жаңартылған) =====
(function () {
    "use strict";

    // ----- DOM элементтері -----
    const checkboxes = document.querySelectorAll('.dish-checkbox');
    const totalSpan = document.getElementById('totalAmount');
    const originalTotalSpan = document.getElementById('originalTotal');
    const customerNameInput = document.getElementById('customerName');
    const placeOrderBtn = document.getElementById('placeOrderBtn');
    const successDiv = document.getElementById('orderSuccess');
    const viewMenuBtn = document.getElementById('viewMenuBtn');
    const menuSection = document.getElementById('menu');

    // Жеңілдік элементтері
    const discountInput = document.getElementById('discountCodeInput');
    const applyDiscountBtn = document.getElementById('applyDiscount');
    const discountMessage = document.getElementById('discountMessage');
    const discountAmountDiv = document.getElementById('discountAmount');
    const discountValueSpan = document.getElementById('discountValue');

    // Викторина элементтері
    const quizContainer = document.getElementById('quiz-container');
    const submitQuizBtn = document.getElementById('submitQuiz');
    const resetQuizBtn = document.getElementById('resetQuiz');
    const quizResult = document.getElementById('quizResult');
    const discountCodeDiv = document.getElementById('discountCode');

    // Жаңа элементтер (викторина модалы)
    const welcomeModal = document.getElementById('welcomeModal');
    const closeWelcomeBtn = document.getElementById('closeWelcomeModal');
    const goToQuizBtn = document.getElementById('goToQuizBtn');
    const maybeLaterBtn = document.getElementById('maybeLaterBtn');
    const heroQuizBtn = document.getElementById('heroQuizBtn');
    const quizNavLink = document.getElementById('quizNavLink');

    // Баға мен жеңілдік айнымалылары
    let currentDiscount = 0; // 0 = жеңілдік жоқ, 0.2 = 20%
    let activeDiscountCode = null;

    // ===== ВИКТОРИНА МОДАЛЫН КӨРСЕТУ =====
    function showWelcomeModal() {
        welcomeModal.classList.add('show');
        document.body.style.overflow = 'hidden'; // скроллды бұғаттау
    }

    function hideWelcomeModal() {
        welcomeModal.classList.remove('show');
        document.body.style.overflow = ''; // скроллды қайта ашу
    }

    // Сайт ашылғанда модалды көрсету (1 секундтан кейін)
    setTimeout(() => {
        showWelcomeModal();
    }, 1000);

    // Модалды жабу батырмалары
    closeWelcomeBtn.addEventListener('click', hideWelcomeModal);
    maybeLaterBtn.addEventListener('click', hideWelcomeModal);

    // Модалдың сыртын басқанда жабу
    welcomeModal.addEventListener('click', (e) => {
        if (e.target === welcomeModal) {
            hideWelcomeModal();
        }
    });

    // "Викторинаға өту" батырмасы
    goToQuizBtn.addEventListener('click', () => {
        hideWelcomeModal();
        // Викторина бөліміне жылжу
        document.getElementById('quiz').scrollIntoView({ behavior: 'smooth' });
    });

    // Hero бөліміндегі "Жеңілдік алу" батырмасы
    heroQuizBtn.addEventListener('click', () => {
        document.getElementById('quiz').scrollIntoView({ behavior: 'smooth' });
    });

    // Навигациядағы викторина сілтемесі
    quizNavLink.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('quiz').scrollIntoView({ behavior: 'smooth' });
    });

    // ===== ВИКТОРИНА СҰРАҚТАРЫ =====
    const quizQuestions = [
        {
            question: "Қазақтың ұлттық тағамы қайсысы?",
            options: ["Борщ", "Бешбармақ", "Пицца", "Сүши"],
            correct: 1
        },
        {
            question: "Лагман қай елдің тағамы?",
            options: ["Орта Азия", "Италия", "Франция", "Жапония"],
            correct: 0
        },
        {
            question: "Манты неше минутта піседі?",
            options: ["10-15 мин", "25-30 мин", "40-45 мин", "1 сағат"],
            correct: 2
        },
        {
            question: "Қазақстанның ұлттық сусыны?",
            options: ["Шай", "Қымыз", "Кофе", "Сок"],
            correct: 1
        },
        {
            question: "Пловтың негізгі ингредиенті?",
            options: ["Күріш", "Макарон", "Картоп", "Гречка"],
            correct: 0
        }
    ];

    // ===== ВИКТОРИНА ИНИЦИАЛИЗАЦИЯСЫ =====
    function renderQuiz() {
        let html = '';
        quizQuestions.forEach((q, index) => {
            html += `
                <div class="question-item" id="question-${index}">
                    <div class="question-text">${index + 1}. ${q.question}</div>
                    <div class="options-group">
                        ${q.options.map((opt, optIndex) => `
                            <label class="option-label">
                                <input type="radio" name="q${index}" value="${optIndex}">
                                ${opt}
                            </label>
                        `).join('')}
                    </div>
                    <div class="question-feedback" id="feedback-${index}"></div>
                </div>
            `;
        });
        quizContainer.innerHTML = html;
    }

    // ===== ВИКТОРИНА ТЕКСЕРУ =====
    function checkQuiz() {
        let correctCount = 0;
        let allAnswered = true;

        quizQuestions.forEach((q, index) => {
            const selected = document.querySelector(`input[name="q${index}"]:checked`);
            const questionItem = document.getElementById(`question-${index}`);
            const feedback = document.getElementById(`feedback-${index}`);

            // Ескі кластарды тазалау
            questionItem.classList.remove('correct', 'incorrect');

            if (selected) {
                const answer = parseInt(selected.value);
                if (answer === q.correct) {
                    correctCount++;
                    questionItem.classList.add('correct');
                    feedback.textContent = `✅ Дұрыс! ${q.options[q.correct]}`;
                } else {
                    questionItem.classList.add('incorrect');
                    feedback.textContent = `❌ Қате! Дұрыс жауап: ${q.options[q.correct]}`;
                }
            } else {
                allAnswered = false;
                questionItem.classList.add('incorrect');
                feedback.textContent = '❌ Жауап берілмеген';
            }
        });

        if (!allAnswered) {
            alert('Барлық сұрақтарға жауап беріңіз!');
            return;
        }

        // Нәтижені көрсету
        quizResult.style.display = 'block';

        if (correctCount === quizQuestions.length) {
            // Барлық жауап дұрыс
            quizResult.className = 'quiz-result success';
            quizResult.textContent = `🎉 Құттықтаймыз! Сіз ${correctCount}/${quizQuestions.length} дұрыс жауап бердіңіз!`;

            // Жеңілдік кодын генерациялау
            generateDiscountCode();
        } else {
            quizResult.className = 'quiz-result failure';
            quizResult.textContent = `😢 Сіз ${correctCount}/${quizQuestions.length} дұрыс жауап бердіңіз. Қайталап көріңіз!`;
            discountCodeDiv.style.display = 'none';
        }
    }

    // ===== ЖЕҢІЛДІК КОДЫН ГЕНЕРАЦИЯЛАУ =====
    function generateDiscountCode() {
        // Код генерациясы: DALA + күн + рандом сан
        const date = new Date();
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const random = Math.floor(Math.random() * 1000);
        const code = `DALA${day}${month}${random}`.toUpperCase();

        activeDiscountCode = code;

        discountCodeDiv.innerHTML = `
            <div>🎫 Сіздің жеңілдік кодыңыз:</div>
            <div style="font-size: 2rem; letter-spacing: 5px;">${code}</div>
            <small>20% жеңілдік алу үшін кодты қолданыңыз</small>
        `;
        discountCodeDiv.style.display = 'block';

        // Кодты автокөшіру үшін
        discountCodeDiv.addEventListener('click', () => {
            navigator.clipboard.writeText(code);
            alert('Код көшірілді!');
        });
    }

    // ===== ЖЕҢІЛДІК КОДЫН ҚОЛДАНУ =====
    function applyDiscount() {
        const code = discountInput.value.trim().toUpperCase();

        if (!code) {
            showDiscountMessage('Кодты енгізіңіз', 'error');
            return;
        }

        if (code === activeDiscountCode) {
            currentDiscount = 0.2; // 20% жеңілдік
            showDiscountMessage('✅ Жеңілдік коды қабылданды! 20% жеңілдік', 'success');
            updatePriceWithDiscount();

            // Жеңілдік мәліметін көрсету
            discountAmountDiv.style.display = 'block';

            // Кодты өшіру (бір рет қолданылады)
            activeDiscountCode = null;
        } else {
            showDiscountMessage('❌ Жарамсыз код', 'error');
            currentDiscount = 0;
            discountAmountDiv.style.display = 'none';
        }
    }

    function showDiscountMessage(msg, type) {
        discountMessage.textContent = msg;
        discountMessage.className = `discount-message ${type}`;
    }

    // ===== БАҒАНЫ ЖЕҢІЛДІКПЕН ЕСЕПТЕУ =====
    function calculateOriginalTotal() {
        let total = 0;
        checkboxes.forEach(cb => {
            if (cb.checked) {
                total += parseInt(cb.value, 10);
            }
        });
        return total;
    }

    function updatePriceWithDiscount() {
        const originalTotal = calculateOriginalTotal();
        originalTotalSpan.textContent = originalTotal;

        if (currentDiscount > 0) {
            const discountValue = Math.round(originalTotal * currentDiscount);
            const finalTotal = originalTotal - discountValue;

            discountValueSpan.textContent = discountValue;
            totalSpan.textContent = finalTotal;
            discountAmountDiv.style.display = 'block';
        } else {
            totalSpan.textContent = originalTotal;
            discountAmountDiv.style.display = 'none';
        }
    }

    // ===== ТАПСЫРЫС БЕРУ (жаңартылған) =====
    placeOrderBtn.addEventListener('click', () => {
        const name = customerNameInput.value.trim();
        const total = parseInt(totalSpan.textContent, 10);
        const originalTotal = parseInt(originalTotalSpan.textContent, 10);
        const anyChecked = Array.from(checkboxes).some(cb => cb.checked);

        if (!name) {
            alert('Аты-жөніңізді енгізіңіз.');
            return;
        }
        if (!anyChecked) {
            alert('Кем дегенде бір тағам таңдаңыз.');
            return;
        }

        let message = `Сәлеметсіз бе, ${name}! Сіздің тапсырысыңыз қабылданды. `;

        if (currentDiscount > 0) {
            const saved = originalTotal - total;
            message += `Бастапқы баға: ${originalTotal} ₸, `;
            message += `Жеңілдік: ${saved} ₸ (20%), `;
        }

        message += `Төлейтін сома: ${total} ₸. Тапсырысыңыз 20 минутта дайын болады.`;

        successDiv.style.display = 'block';
        successDiv.textContent = message;
    });

    // ===== EVENT LISTENERLER =====
    checkboxes.forEach(cb => {
        cb.addEventListener('change', updatePriceWithDiscount);
    });

    applyDiscountBtn.addEventListener('click', applyDiscount);
    submitQuizBtn.addEventListener('click', checkQuiz);

    resetQuizBtn.addEventListener('click', () => {
        // Барлық радио батырмаларды тазалау
        document.querySelectorAll('input[type="radio"]').forEach(radio => {
            radio.checked = false;
        });

        // Қате/дұрыс кластарын тазалау
        document.querySelectorAll('.question-item').forEach(item => {
            item.classList.remove('correct', 'incorrect');
        });

        // Нәтижелерді жасыру
        quizResult.style.display = 'none';
        discountCodeDiv.style.display = 'none';
        activeDiscountCode = null;
    });

    // Бастапқы render
    renderQuiz();
    updatePriceWithDiscount();

    // ===== АВТОРИЗАЦИЯ КОДТАРЫ (қысқартылған нұсқа) =====
    // Толық авторизация коды бұрынғы нұсқада қалады

})();
// ===== СУРЕТ ЖҮКТЕУ ФУНКЦИЯСЫ =====

// Сурет жүктеу батырмаларын іздеу
const downloadButtons = document.querySelectorAll('.download-image-btn');

// Әр батырмаға event listener қосу
downloadButtons.forEach(button => {
    button.addEventListener('click', function (e) {
        e.preventDefault(); // Басқа әрекеттерді болдырмау
        e.stopPropagation(); // Оқиғаның таралуын тоқтату

        const imageName = this.dataset.image;
        const dishName = this.dataset.name;
        downloadImage(imageName, dishName);
    });
});

/**
 * Суретті жүктеу функциясы
 * @param {string} imageName - Сурет аты (lagman, beshbarmak, plov, manty)
 * @param {string} dishName - Тағам аты (көрсету үшін)
 */
function downloadImage(imageName, dishName) {
    // Сурет жолын анықтау
    const imagePath = `images/${imageName}.jpg`;

    // Кэшті болдырмау үшін кездейсоқ параметр қосу
    const uniqueParam = `?t=${Date.now()}`;
    const imageUrl = imagePath + uniqueParam;

    // Жүктеу хабарын көрсету
    showDownloadMessage(`"${dishName}" суреті жүктелуде...`, 'info');

    // Суретті жүктеу [citation:1]
    fetch(imageUrl, {
        method: 'GET',
        mode: 'cors',
        cache: 'reload',
        headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Сурет табылмады');
            }
            return response.blob(); // Blob объектісіне айналдыру [citation:3]
        })
        .then(blob => {
            // Blob-тан URL жасау
            const blobUrl = window.URL.createObjectURL(blob);

            // Уақытша сілтеме жасау
            const link = document.createElement('a');
            link.href = blobUrl;

            // Жүктелетін файлдың атын құру (күнімен)
            const date = new Date();
            const dateStr = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
            link.download = `DalaDoma_${dishName}_${dateStr}.jpg`;

            // Сілтемені басу [citation:1]
            document.body.appendChild(link);
            link.click();

            // Тазалау
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);

            // Сәтті жүктеу хабары
            showDownloadMessage(`"${dishName}" суреті жүктелді!`, 'success');
        })
        .catch(error => {
            console.error('Жүктеу қатесі:', error);

            // Қате болса, альтернативті әдіс - тікелей сілтеме
            fallbackDownload(imagePath, dishName);
        });
}

/**
 * Альтернативті жүктеу әдісі (fetch жұмыс істемесе)
 */
function fallbackDownload(imagePath, dishName) {
    try {
        // Тікелей сілтеме жасау
        const link = document.createElement('a');
        link.href = imagePath;
        link.download = `DalaDoma_${dishName}.jpg`;
        link.target = '_blank';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showDownloadMessage(`"${dishName}" суреті жүктелді!`, 'success');
    } catch (error) {
        showDownloadMessage('Қате орын алды. Қайталап көріңіз.', 'error');
    }
}

/**
 * Хабарлама көрсету
 */
function showDownloadMessage(text, type = 'info') {
    // Ескі хабарламаны өшіру
    const oldToast = document.querySelector('.download-toast');
    if (oldToast) {
        oldToast.remove();
    }

    // Жаңа хабарлама жасау
    const toast = document.createElement('div');
    toast.className = 'download-toast';

    // Түріне қарай фон түсі
    if (type === 'success') {
        toast.style.background = '#3b5e3b';
    } else if (type === 'error') {
        toast.style.background = '#dc3545';
    } else {
        toast.style.background = '#b45f2b';
    }

    toast.textContent = text;
    document.body.appendChild(toast);

    // 3 секундтан кейін жоғалту
    setTimeout(() => {
        if (toast && toast.parentNode) {
            toast.remove();
        }
    }, 3000);
}

/**
 * Барлық суреттерді бірден жүктеу (қосымша функция)
 */
function downloadAllImages() {
    const dishes = [
        { name: 'Лагман', file: 'lagman' },
        { name: 'Бешбармақ', file: 'beshbarmak' },
        { name: 'Плов', file: 'plov' },
        { name: 'Манты', file: 'manty' }
    ];

    let count = 0;
    showDownloadMessage('Суреттер жүктелуде...', 'info');

    dishes.forEach((dish, index) => {
        setTimeout(() => {
            downloadImage(dish.file, dish.name);
            count++;

            if (count === dishes.length) {
                setTimeout(() => {
                    showDownloadMessage('Барлық суреттер жүктелді!', 'success');
                }, 1000);
            }
        }, index * 800); // Әр суретті 0.8 секунд аралықпен жүктеу
    });
}

/**
 * Суретті жаңа терезеде ашу (қосымша)
 */
function openImageInNewTab(imageName) {
    const imagePath = `images/${imageName}.jpg`;
    window.open(imagePath, '_blank');
}
// ===== ТІРКЕЛУ ҰЗАҚТЫҒЫН ЕСЕПТЕУ =====
// Бұл кодты script.js файлының соңына қосыңыз

/**
 * Тіркелу уақытын есептеу функциясы
 */
(function () {
    "use strict";

    let registrationStartTime = null;
    let registrationEndTime = null;
    let registrationTimer = null;
    let registrationDuration = 0;

    // Таймер элементін жасау
    const timerElement = document.createElement('div');
    timerElement.className = 'registration-timer';
    timerElement.style.cssText = `
        background: #f0e3d5;
        padding: 0.5rem 1rem;
        border-radius: 50px;
        font-size: 0.9rem;
        margin-bottom: 1rem;
        text-align: center;
        color: #b45f2b;
        font-weight: 600;
        display: none;
    `;

    // Тіркелу модалына таймерді қосу
    const registerModalContent = document.getElementById('registerModalContent');
    if (registerModalContent) {
        const modalHeader = registerModalContent.querySelector('h2');
        if (modalHeader) {
            modalHeader.insertAdjacentElement('afterend', timerElement);
        }
    }

    // Таймерді жаңарту
    function updateTimer() {
        if (!registrationStartTime) return;

        const now = Date.now();
        const elapsed = Math.floor((now - registrationStartTime) / 1000); // секунд

        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;

        timerElement.textContent = `⏱️ Тіркелу уақыты: ${minutes}:${seconds.toString().padStart(2, '0')}`;
        registrationDuration = elapsed;
    }

    // Таймерді бастау
    function startRegistrationTimer() {
        registrationStartTime = Date.now();
        registrationEndTime = null;
        registrationDuration = 0;

        timerElement.style.display = 'block';
        updateTimer();

        // Әр секунд сайын жаңарту
        if (registrationTimer) {
            clearInterval(registrationTimer);
        }

        registrationTimer = setInterval(updateTimer, 1000);
    }

    // Таймерді тоқтату және нәтижені көрсету
    function stopRegistrationTimer(success = true) {
        if (!registrationStartTime) return;

        registrationEndTime = Date.now();

        if (registrationTimer) {
            clearInterval(registrationTimer);
            registrationTimer = null;
        }

        const elapsed = registrationDuration;

        if (success && elapsed > 0) {
            // Тіркелу сәтті аяқталды - нәтижені көрсету
            showRegistrationResult(elapsed);
        }

        registrationStartTime = null;
    }

    // Тіркелу нәтижесін көрсету
    function showRegistrationResult(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;

        let timeText = '';
        if (minutes > 0) {
            timeText = `${minutes} минут ${remainingSeconds} секунд`;
        } else {
            timeText = `${seconds} секунд`;
        }

        // Нәтиже хабарламасын жасау
        const resultDiv = document.createElement('div');
        resultDiv.className = 'registration-result';
        resultDiv.style.cssText = `
            background: #e7f3da;
            border-left: 8px solid #3b5e3b;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            margin-top: 1rem;
            font-size: 1rem;
            color: #1f3b1f;
            animation: fadeSlide 0.5s ease;
        `;

        let message = '';
        if (seconds < 30) {
            message = `🔥 Керемет! Сіз небәрі ${timeText} ішінде тіркелдіңіз!`;
        } else if (seconds < 60) {
            message = `✅ Жақсы! Тіркелу уақыты: ${timeText}`;
        } else {
            message = `⏱️ Тіркелу уақыты: ${timeText}`;
        }

        resultDiv.innerHTML = `
            <strong>${message}</strong><br>
            <small>Орташа тіркелу уақыты: 45 секунд</small>
        `;

        // Нәтижені тіркелу модалына қосу
        const registerError = document.getElementById('registerError');
        const registerSuccess = document.getElementById('registerSuccess');

        if (registerSuccess && registerSuccess.style.display === 'block') {
            registerSuccess.insertAdjacentElement('afterend', resultDiv);

            // 5 секундтан кейін өшіру
            setTimeout(() => {
                if (resultDiv.parentNode) {
                    resultDiv.remove();
                }
            }, 5000);
        }
    }

    // Таймерді қалпына келтіру
    function resetRegistrationTimer() {
        if (registrationTimer) {
            clearInterval(registrationTimer);
            registrationTimer = null;
        }

        registrationStartTime = null;
        registrationEndTime = null;
        registrationDuration = 0;
        timerElement.style.display = 'none';
        timerElement.textContent = '';
    }

    // Тіркелу модалы ашылғанда таймерді бастау
    const originalRegisterBtn = document.getElementById('registerBtn');
    const registerModal = document.getElementById('registerModalOverlay');

    if (originalRegisterBtn && registerModal) {
        // Бастапқы тіркелу батырмасы
        originalRegisterBtn.addEventListener('click', function () {
            resetRegistrationTimer();
            startRegistrationTimer();
        });

        // "Кіру" модалынан ауысқанда
        const switchToRegister = document.getElementById('switchToRegister');
        if (switchToRegister) {
            switchToRegister.addEventListener('click', function () {
                setTimeout(() => {
                    resetRegistrationTimer();
                    startRegistrationTimer();
                }, 300);
            });
        }
    }

    // Тіркелу формасы жіберілгенде таймерді тоқтату
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function (e) {
            // Форма жіберілгеннен кейін таймерді тоқтату
            setTimeout(() => {
                const registerSuccess = document.getElementById('registerSuccess');
                if (registerSuccess && registerSuccess.style.display === 'block') {
                    stopRegistrationTimer(true);
                }
            }, 100);
        });
    }

    // Тіркелу модалы жабылғанда таймерді тоқтату
    const closeRegisterBtn = document.getElementById('closeRegisterModalBtn');
    if (closeRegisterBtn) {
        closeRegisterBtn.addEventListener('click', function () {
            stopRegistrationTimer(false);
            resetRegistrationTimer();
        });
    }

    // Модал сыртын басқанда
    if (registerModal) {
        registerModal.addEventListener('click', function (e) {
            if (e.target === registerModal) {
                stopRegistrationTimer(false);
                resetRegistrationTimer();
            }
        });
    }

    // Esc пернесі басылғанда
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && registerModal && registerModal.classList.contains('show')) {
            stopRegistrationTimer(false);
            resetRegistrationTimer();
        }
    });

    console.log('✅ Тіркелу ұзақтығын есептеу қосылды');
})();
// ===== ТІРКЕЛУ ҚАТЕЛЕРІН ЕСЕПТЕУ ЖҮЙЕСІ =====
(function () {
    "use strict";

    // Қателерді есептеу айнымалылары
    let registrationErrorCount = 0;
    let fieldErrorCount = {
        name: 0,
        email: 0,
        password: 0,
        confirm: 0
    };

    // Статистика элементін жасау
    const errorStatsElement = document.createElement('div');
    errorStatsElement.className = 'error-statistics';
    errorStatsElement.style.cssText = `
        background: #fff3f3;
        border: 2px solid #dc3545;
        border-radius: 50px;
        padding: 0.7rem 1.2rem;
        margin-bottom: 1.5rem;
        font-size: 0.95rem;
        text-align: center;
        color: #dc3545;
        font-weight: 600;
        display: none;
        animation: fadeSlide 0.3s ease;
    `;

    // Тіркелу модалына статистика элементін қосу
    const registerModalContent = document.getElementById('registerModalContent');
    if (registerModalContent) {
        const modalHeader = registerModalContent.querySelector('h2');
        if (modalHeader) {
            modalHeader.insertAdjacentElement('afterend', errorStatsElement);
        }
    }

    // Қателер статистикасын жаңарту
    function updateErrorStats() {
        if (registrationErrorCount === 0) {
            errorStatsElement.style.display = 'none';
            return;
        }

        let message = `❌ Қателер саны: ${registrationErrorCount} | `;

        // Әр өріс бойынша статистика
        const fieldMessages = [];
        if (fieldErrorCount.name > 0) fieldMessages.push(`Аты-жөні: ${fieldErrorCount.name}`);
        if (fieldErrorCount.email > 0) fieldMessages.push(`Email: ${fieldErrorCount.email}`);
        if (fieldErrorCount.password > 0) fieldMessages.push(`Құпия сөз: ${fieldErrorCount.password}`);
        if (fieldErrorCount.confirm > 0) fieldMessages.push(`Растау: ${fieldErrorCount.confirm}`);

        message += fieldMessages.join(' | ');

        // Қателер санына қарай стильді өзгерту
        if (registrationErrorCount >= 5) {
            errorStatsElement.style.background = '#ffd7d7';
            errorStatsElement.style.borderColor = '#b02a37';
        } else if (registrationErrorCount >= 3) {
            errorStatsElement.style.background = '#ffe6e6';
            errorStatsElement.style.borderColor = '#dc3545';
        } else {
            errorStatsElement.style.background = '#fff3f3';
            errorStatsElement.style.borderColor = '#ff8a8a';
        }

        errorStatsElement.textContent = message;
        errorStatsElement.style.display = 'block';
    }

    // Қате қосу функциясы
    function addError(field) {
        registrationErrorCount++;

        if (field && fieldErrorCount.hasOwnProperty(field)) {
            fieldErrorCount[field]++;
        }

        updateErrorStats();

        // Дыбыстық ескерту (қосымша)
        console.log(`🔔 Қате қосылды! Жалпы қателер: ${registrationErrorCount}`);
    }

    // Қателерді қалпына келтіру
    function resetErrors() {
        registrationErrorCount = 0;
        fieldErrorCount = {
            name: 0,
            email: 0,
            password: 0,
            confirm: 0
        };
        errorStatsElement.style.display = 'none';
    }

    // Тіркелу формасының өрістерін бақылау
    const registerName = document.getElementById('registerName');
    const registerEmail = document.getElementById('registerEmail');
    const registerPassword = document.getElementById('registerPassword');
    const confirmPassword = document.getElementById('confirmPassword');

    // Әр өріс үшін қателерді бақылау
    if (registerName) {
        registerName.addEventListener('blur', function () {
            if (this.value.trim().length < 2 && this.value.trim().length > 0) {
                addError('name');
                this.classList.add('error-shake');
                setTimeout(() => this.classList.remove('error-shake'), 500);
            }
        });
    }

    if (registerEmail) {
        registerEmail.addEventListener('blur', function () {
            const email = this.value.trim();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (email.length > 0 && !emailRegex.test(email)) {
                addError('email');
                this.classList.add('error-shake');
                setTimeout(() => this.classList.remove('error-shake'), 500);
            }
        });
    }

    if (registerPassword) {
        registerPassword.addEventListener('blur', function () {
            const password = this.value;

            if (password.length > 0) {
                let hasError = false;

                if (password.length < 8) {
                    addError('password');
                    hasError = true;
                }
                if (!/[A-Z]/.test(password)) {
                    addError('password');
                    hasError = true;
                }
                if (!/\d/.test(password)) {
                    addError('password');
                    hasError = true;
                }

                if (hasError) {
                    this.classList.add('error-shake');
                    setTimeout(() => this.classList.remove('error-shake'), 500);
                }
            }
        });
    }

    if (confirmPassword) {
        confirmPassword.addEventListener('blur', function () {
            const password = registerPassword ? registerPassword.value : '';

            if (this.value.length > 0 && this.value !== password) {
                addError('confirm');
                this.classList.add('error-shake');
                setTimeout(() => this.classList.remove('error-shake'), 500);
            }
        });
    }

    // Форма жіберілгенде соңғы статистиканы көрсету
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function (e) {
            e.preventDefault(); // Уақытша тоқтату

            // Барлық өрістерді тексеру
            let hasErrors = false;

            // Аты-жөні
            if (!registerName.value.trim()) {
                addError('name');
                hasErrors = true;
            }

            // Email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(registerEmail.value.trim())) {
                addError('email');
                hasErrors = true;
            }

            // Құпия сөз
            const password = registerPassword.value;
            if (password.length < 8 || !/[A-Z]/.test(password) || !/\d/.test(password)) {
                addError('password');
                hasErrors = true;
            }

            // Растау
            if (password !== confirmPassword.value) {
                addError('confirm');
                hasErrors = true;
            }

            if (!hasErrors && registrationErrorCount > 0) {
                // Қателер болса да, соңында сәтті тіркелсе
                showRegistrationSummary();
            }

            // Форманы жіберу (егер қателер түзетілсе)
            if (!hasErrors) {
                setTimeout(() => {
                    // Түпнұсқа submit оқиғасын шақыру
                    const originalSubmit = new Event('submit', { cancelable: true });
                    registerForm.dispatchEvent(originalSubmit);
                }, 100);
            }
        });
    }

    // Тіркелу нәтижесін көрсету
    function showRegistrationSummary() {
        const registerSuccess = document.getElementById('registerSuccess');

        if (registerSuccess && registerSuccess.style.display === 'block') {
            const summaryDiv = document.createElement('div');
            summaryDiv.className = 'registration-summary';
            summaryDiv.style.cssText = `
                background: linear-gradient(135deg, #fff5e6, #ffe4d6);
                border-radius: 16px;
                padding: 1.2rem;
                margin-top: 1rem;
                border: 2px solid #b45f2b;
                animation: fadeSlide 0.5s ease;
            `;

            let errorMessage = '';
            if (registrationErrorCount === 0) {
                errorMessage = '🥇 Мінсіз! Бірде-бір қатесіз тіркелдіңіз!';
            } else if (registrationErrorCount === 1) {
                errorMessage = '👍 Өте жақсы! Тек 1 қате жібердіңіз.';
            } else if (registrationErrorCount <= 3) {
                errorMessage = `👌 Жақсы! ${registrationErrorCount} қате жібердіңіз.`;
            } else if (registrationErrorCount <= 5) {
                errorMessage = `💪 Талпыныңыз! ${registrationErrorCount} қате, келесіде жақсырақ болады.`;
            } else {
                errorMessage = `😅 ${registrationErrorCount} қате! Бірақ маңыздысы - тіркелдіңіз!`;
            }

            // Өрістер бойынша қателер
            const fieldErrors = [];
            if (fieldErrorCount.name > 0) fieldErrors.push(`Аты-жөні: ${fieldErrorCount.name}`);
            if (fieldErrorCount.email > 0) fieldErrors.push(`Email: ${fieldErrorCount.email}`);
            if (fieldErrorCount.password > 0) fieldErrors.push(`Құпия сөз: ${fieldErrorCount.password}`);
            if (fieldErrorCount.confirm > 0) fieldErrors.push(`Растау: ${fieldErrorCount.confirm}`);

            summaryDiv.innerHTML = `
                <div style="font-size: 1.2rem; font-weight: 700; color: #b45f2b; margin-bottom: 0.5rem;">
                    📊 Тіркелу статистикасы
                </div>
                <div style="margin-bottom: 0.8rem; font-size: 1.1rem;">
                    ${errorMessage}
                </div>
                ${fieldErrors.length > 0 ? `
                    <div style="background: white; border-radius: 12px; padding: 0.8rem; font-size: 0.95rem;">
                        <div style="font-weight: 600; margin-bottom: 0.3rem; color: #4f443b;">Өрістер бойынша:</div>
                        <div style="display: flex; flex-wrap: wrap; gap: 0.8rem;">
                            ${fieldErrors.map(err => `<span style="background: #f0e3d5; padding: 0.2rem 0.8rem; border-radius: 20px;">${err}</span>`).join('')}
                        </div>
                    </div>
                ` : ''}
            `;

            registerSuccess.insertAdjacentElement('afterend', summaryDiv);

            // 7 секундтан кейін өшіру
            setTimeout(() => {
                if (summaryDiv.parentNode) {
                    summaryDiv.remove();
                }
            }, 7000);
        }
    }

    // Тіркелу модалы ашылғанда қателерді қалпына келтіру
    const registerBtn = document.getElementById('registerBtn');
    const switchToRegister = document.getElementById('switchToRegister');
    const registerModal = document.getElementById('registerModalOverlay');

    function resetOnOpen() {
        resetErrors();
    }

    if (registerBtn) {
        registerBtn.addEventListener('click', resetOnOpen);
    }

    if (switchToRegister) {
        switchToRegister.addEventListener('click', function () {
            setTimeout(resetOnOpen, 300);
        });
    }

    // Модал жабылғанда қателерді қалпына келтіру
    const closeRegisterBtn = document.getElementById('closeRegisterModalBtn');
    if (closeRegisterBtn) {
        closeRegisterBtn.addEventListener('click', resetErrors);
    }

    if (registerModal) {
        registerModal.addEventListener('click', function (e) {
            if (e.target === registerModal) {
                resetErrors();
            }
        });
    }

    // Қате болғанда анимация
    const style = document.createElement('style');
    style.textContent = `
        .error-shake {
            animation: shake 0.5s ease-in-out;
            border-color: #dc3545 !important;
            background-color: #fff0f0 !important;
        }
        
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            20% { transform: translateX(-10px); }
            40% { transform: translateX(10px); }
            60% { transform: translateX(-5px); }
            80% { transform: translateX(5px); }
        }
        
        .error-statistics {
            transition: all 0.3s ease;
        }
    `;
    document.head.appendChild(style);

    console.log('✅ Тіркелу қателерін есептеу жүйесі қосылды');
})();





// ===== script.js (DeepSeek API жаңа кілтпен) =====
(function () {
    "use strict";

    // 🔑 DeepSeek API кілті (жаңа)
    const DEEPSEEK_API_KEY = "sk-49b98753acbe46a08ff98fa49172f608";
    const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";

    // ----- DOM элементтері -----
    const checkboxes = document.querySelectorAll('.dish-checkbox');
    const totalSpan = document.getElementById('totalAmount');
    const originalTotalSpan = document.getElementById('originalTotal');
    const customerNameInput = document.getElementById('customerName');
    const placeOrderBtn = document.getElementById('placeOrderBtn');
    const successDiv = document.getElementById('orderSuccess');
    const viewMenuBtn = document.getElementById('viewMenuBtn');
    const menuSection = document.getElementById('menu');

    const discountInput = document.getElementById('discountCodeInput');
    const applyDiscountBtn = document.getElementById('applyDiscount');
    const discountMessage = document.getElementById('discountMessage');
    const discountAmountDiv = document.getElementById('discountAmount');
    const discountValueSpan = document.getElementById('discountValue');

    const quizContainer = document.getElementById('quiz-container');
    const submitQuizBtn = document.getElementById('submitQuiz');
    const resetQuizBtn = document.getElementById('resetQuiz');
    const quizResult = document.getElementById('quizResult');
    const discountCodeDiv = document.getElementById('discountCode');

    const welcomeModal = document.getElementById('welcomeModal');
    const closeWelcomeBtn = document.getElementById('closeWelcomeModal');
    const goToQuizBtn = document.getElementById('goToQuizBtn');
    const maybeLaterBtn = document.getElementById('maybeLaterBtn');
    const heroQuizBtn = document.getElementById('heroQuizBtn');
    const quizNavLink = document.getElementById('quizNavLink');

    const chatbot = document.getElementById('chatbot');
    const toggleChat = document.getElementById('toggleChat');
    const chatMessages = document.getElementById('chatMessages');
    const userInput = document.getElementById('userInput');
    const sendMessage = document.getElementById('sendMessage');
    const voiceBtn = document.getElementById('voiceBtn');
    const closeChat = document.getElementById('closeChat');

    let currentDiscount = 0;
    let activeDiscountCode = null;
    let isVoiceMode = false;

    // ===== DEEPSEEK API ФУНКЦИЯСЫ (ЖАҢА КІЛТПЕН) =====
    async function getDeepSeekResponse(prompt) {
        try {
            console.log("📤 DeepSeek API-ге сұраныс жіберілуде...");

            const response = await fetch(DEEPSEEK_API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${DEEPSEEK_API_KEY}`
                },
                body: JSON.stringify({
                    model: "deepseek-chat",
                    messages: [
                        {
                            role: "system",
                            content: "Сен 'Dala' мейрамханасының көмекшісісің. Мәзір: Лагман (2800 ₸), Бешбармақ (4200 ₸), Плов (2100 ₸), Манты (3200 ₸). Мекенжай: Абай даңғылы 12, Алматы. Жұмыс уақыты: 11:00-23:00. Қазақша қысқа әрі сыпайы жауап бер."
                        },
                        { role: "user", content: prompt }
                    ],
                    temperature: 0.7,
                    max_tokens: 500
                })
            });

            console.log("📥 Жауап статусы:", response.status);

            if (!response.ok) {
                const error = await response.json();
                console.error("DeepSeek API қатесі:", error);

                if (response.status === 401) return "🔑 API кілті қате!";
                if (response.status === 402) {
                    console.log("💰 Баланс жеткіліксіз, оффлайн режимге ауысу...");
                    return getOfflineResponse(prompt);
                }
                if (response.status === 429) return "⏳ Тым көп сұраныс. Кішкене күтіңіз.";
                return `❌ Қате (${response.status})`;
            }

            const data = await response.json();
            console.log("✅ Жауап алынды:", data);

            return data.choices[0].message.content;
        } catch (error) {
            console.error("❌ Желі қатесі:", error);
            return getOfflineResponse(prompt);
        }
    }

    // ===== ОФФЛАЙН РЕЖИМ (егер API жұмыс істемесе) =====
    function getOfflineResponse(prompt) {
        const lower = prompt.toLowerCase().trim();

        if (lower.includes('лагман')) {
            return "🍜 **Лагман** - 2800 ₸\nҚолмен созылған лапша, сиыр еті, көкөністер";
        }
        if (lower.includes('бешбармақ')) {
            return "🍖 **Бешбармақ** - 4200 ₸\nЖылқы еті, қамыр, сорпа, пияз";
        }
        if (lower.includes('плов')) {
            return "🍚 **Плов** - 2100 ₸\nҚой еті, күріш, сәбіз, сарымсақ";
        }
        if (lower.includes('манты')) {
            return "🥟 **Манты** - 3200 ₸\nСиыр еті, пияз, қамыр, қаймақ";
        }
        if (lower.includes('мекенжай') || lower.includes('қайда')) {
            return "📍 **Мекенжай:** Абай даңғылы 12, Алматы\n📞 **Телефон:** +7 (727) 345-67-89";
        }
        if (lower.includes('уақыт') || lower.includes('сағат')) {
            return "⏰ **Жұмыс уақыты:** дүйсенбі-жексенбі 11:00 – 23:00";
        }
        if (lower.includes('мәзір') || lower.includes('меню')) {
            return "📋 **Мәзіріміз:**\n\n🍜 Лагман - 2800 ₸\n🍖 Бешбармақ - 4200 ₸\n🍚 Плов - 2100 ₸\n🥟 Манты - 3200 ₸";
        }
        if (lower.includes('сәлем') || lower.includes('салем')) {
            return "Сәлеметсіз бе! Dala мейрамханасының көмекшісімін. 😊\n\nМәзірімізбен танысыңыз:\n• Лагман - 2800 ₸\n• Бешбармақ - 4200 ₸\n• Плов - 2100 ₸\n• Манты - 3200 ₸";
        }
        if (lower.includes('рахмет') || lower.includes('рақмет')) {
            return "Рахмет! Сізге көмектесуге қуаныштымын! 🌟";
        }

        return "Кешіріңіз, мен сізді түсінбедім. 🤔\n\nСіз мыналарды сұрай аласыз:\n• Мәзір\n• Лагман, бешбармақ, плов, манты\n• Мекенжай, жұмыс уақыты";
    }

    // ===== ЧАТ ФУНКЦИЯЛАРЫ =====
    function addMessage(text, sender) {
        if (!chatMessages) return;
        const div = document.createElement('div');
        div.className = `message ${sender}`;
        div.textContent = text;
        chatMessages.appendChild(div);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    async function handleChat(text) {
        if (!text.trim()) return;

        addMessage(text, 'user');
        if (userInput) userInput.value = '';

        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot';
        typingDiv.textContent = '✍️ Жазып жатыр...';
        typingDiv.id = 'typing-indicator';
        chatMessages?.appendChild(typingDiv);
        chatMessages?.scrollTo(0, chatMessages.scrollHeight);

        const reply = await getDeepSeekResponse(text);

        document.getElementById('typing-indicator')?.remove();
        addMessage(reply, 'bot');

        if (isVoiceMode && window.speechSynthesis) {
            const msg = new SpeechSynthesisUtterance(reply.replace(/[*#]/g, ''));
            msg.lang = 'kk-KZ';
            window.speechSynthesis.speak(msg);
            isVoiceMode = false;
        }

        const lower = text.toLowerCase();
        if (lower.includes('лагман')) document.getElementById('dishLagman')?.click();
        if (lower.includes('бешбармақ')) document.getElementById('dishBesh')?.click();
        if (lower.includes('плов')) document.getElementById('dishPlov')?.click();
        if (lower.includes('манты')) document.getElementById('dishManty')?.click();

        updatePriceWithDiscount();
    }

    // ===== ЧАТ ИНИЦИАЛИЗАЦИЯСЫ =====
    if (sendMessage) {
        sendMessage.addEventListener('click', () => handleChat(userInput?.value || ''));
    }

    if (userInput) {
        userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleChat(userInput.value);
        });
    }

    if (toggleChat) {
        toggleChat.addEventListener('click', () => {
            chatbot?.classList.toggle('active');
        });
    }

    if (closeChat) {
        closeChat.addEventListener('click', () => {
            chatbot?.classList.remove('active');
        });
    }

    // ===== ДАУЫСТЫ ТАНУ =====
    if (voiceBtn && (window.SpeechRecognition || window.webkitSpeechRecognition)) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = 'kk-KZ';

        voiceBtn.addEventListener('click', () => {
            isVoiceMode = true;
            voiceBtn.classList.add('listening');
            recognition.start();
        });

        recognition.onresult = (event) => {
            const text = event.results[0][0].transcript;
            if (userInput) userInput.value = text;
            handleChat(text);
        };

        recognition.onend = () => {
            voiceBtn.classList.remove('listening');
        };
    }

    // ===== ВИКТОРИНА МОДАЛЫ =====
    setTimeout(() => {
        if (welcomeModal) welcomeModal.classList.add('show');
    }, 1000);

    if (closeWelcomeBtn) closeWelcomeBtn.addEventListener('click', () => {
        welcomeModal.classList.remove('show');
    });

    if (goToQuizBtn) goToQuizBtn.addEventListener('click', () => {
        welcomeModal.classList.remove('show');
        document.getElementById('quiz')?.scrollIntoView({ behavior: 'smooth' });
    });

    // ===== ВИКТОРИНА СҰРАҚТАРЫ =====
    const quizQuestions = [
        { question: "Қазақтың ұлттық тағамы қайсысы?", options: ["Борщ", "Бешбармақ", "Пицца", "Сүши"], correct: 1 },
        { question: "Лагман қай елдің тағамы?", options: ["Орта Азия", "Италия", "Франция", "Жапония"], correct: 0 },
        { question: "Манты неше минутта піседі?", options: ["10-15 мин", "25-30 мин", "40-45 мин", "1 сағат"], correct: 2 },
        { question: "Қазақстанның ұлттық сусыны?", options: ["Шай", "Қымыз", "Кофе", "Сок"], correct: 1 },
        { question: "Пловтың негізгі ингредиенті?", options: ["Күріш", "Макарон", "Картоп", "Гречка"], correct: 0 }
    ];

    function renderQuiz() {
        if (!quizContainer) return;
        let html = '';
        quizQuestions.forEach((q, index) => {
            html += `
                <div class="question-item" id="question-${index}">
                    <div class="question-text">${index + 1}. ${q.question}</div>
                    <div class="options-group">
                        ${q.options.map((opt, optIndex) => `
                            <label class="option-label">
                                <input type="radio" name="q${index}" value="${optIndex}"> ${opt}
                            </label>
                        `).join('')}
                    </div>
                    <div class="question-feedback" id="feedback-${index}"></div>
                </div>
            `;
        });
        quizContainer.innerHTML = html;
    }

    function checkQuiz() {
        let correctCount = 0;
        let allAnswered = true;

        quizQuestions.forEach((q, index) => {
            const selected = document.querySelector(`input[name="q${index}"]:checked`);
            const questionItem = document.getElementById(`question-${index}`);
            const feedback = document.getElementById(`feedback-${index}`);

            questionItem?.classList.remove('correct', 'incorrect');

            if (selected) {
                const answer = parseInt(selected.value);
                if (answer === q.correct) {
                    correctCount++;
                    questionItem?.classList.add('correct');
                    if (feedback) feedback.textContent = `✅ Дұрыс! ${q.options[q.correct]}`;
                } else {
                    questionItem?.classList.add('incorrect');
                    if (feedback) feedback.textContent = `❌ Қате! Дұрыс жауап: ${q.options[q.correct]}`;
                }
            } else {
                allAnswered = false;
                questionItem?.classList.add('incorrect');
                if (feedback) feedback.textContent = '❌ Жауап берілмеген';
            }
        });

        if (!allAnswered) {
            alert('Барлық сұрақтарға жауап беріңіз!');
            return;
        }

        if (quizResult) {
            quizResult.style.display = 'block';
            if (correctCount === quizQuestions.length) {
                quizResult.className = 'quiz-result success';
                quizResult.textContent = `🎉 Құттықтаймыз! Сіз ${correctCount}/${quizQuestions.length} дұрыс жауап бердіңіз!`;
                generateDiscountCode();
            } else {
                quizResult.className = 'quiz-result failure';
                quizResult.textContent = `😢 Сіз ${correctCount}/${quizQuestions.length} дұрыс жауап бердіңіз. Қайталап көріңіз!`;
                if (discountCodeDiv) discountCodeDiv.style.display = 'none';
            }
        }
    }

    function generateDiscountCode() {
        const date = new Date();
        const code = `DALA${date.getDate()}${date.getMonth() + 1}${Math.floor(Math.random() * 1000)}`.toUpperCase();
        activeDiscountCode = code;

        if (discountCodeDiv) {
            discountCodeDiv.innerHTML = `
                <div>🎫 Сіздің жеңілдік кодыңыз:</div>
                <div style="font-size: 2rem; letter-spacing: 5px;">${code}</div>
                <small>20% жеңілдік алу үшін кодты қолданыңыз</small>
            `;
            discountCodeDiv.style.display = 'block';
        }
    }

    // ===== БАҒА ЕСЕПТЕУ =====
    function calculateTotal() {
        let total = 0;
        checkboxes.forEach(cb => { if (cb.checked) total += parseInt(cb.value, 10); });
        return total;
    }

    function updatePriceWithDiscount() {
        const originalTotal = calculateTotal();
        if (originalTotalSpan) originalTotalSpan.textContent = originalTotal;

        if (currentDiscount > 0 && originalTotal > 0) {
            const discountValue = Math.round(originalTotal * currentDiscount);
            const finalTotal = originalTotal - discountValue;
            if (discountValueSpan) discountValueSpan.textContent = discountValue;
            if (totalSpan) totalSpan.textContent = finalTotal;
            if (discountAmountDiv) discountAmountDiv.style.display = 'block';
        } else {
            if (totalSpan) totalSpan.textContent = originalTotal;
            if (discountAmountDiv) discountAmountDiv.style.display = 'none';
        }
    }

    // ===== ЖЕҢІЛДІК КОДЫН ҚОЛДАНУ =====
    if (applyDiscountBtn) {
        applyDiscountBtn.addEventListener('click', () => {
            const code = discountInput?.value.trim().toUpperCase();
            if (!code) {
                if (discountMessage) discountMessage.textContent = '❌ Кодты енгізіңіз';
                return;
            }

            if (code === activeDiscountCode) {
                currentDiscount = 0.2;
                discountMessage.textContent = '✅ Жеңілдік коды қабылданды! 20% жеңілдік';
                discountMessage.className = 'discount-message success';
                updatePriceWithDiscount();
                activeDiscountCode = null;
            } else {
                discountMessage.textContent = '❌ Жарамсыз код';
                discountMessage.className = 'discount-message error';
                currentDiscount = 0;
                updatePriceWithDiscount();
            }
        });
    }

    // ===== ТАПСЫРЫС БЕРУ =====
    if (placeOrderBtn) {
        placeOrderBtn.addEventListener('click', () => {
            const name = customerNameInput?.value.trim();
            const total = parseInt(totalSpan?.textContent || '0', 10);
            const originalTotal = parseInt(originalTotalSpan?.textContent || '0', 10);
            const anyChecked = Array.from(checkboxes).some(cb => cb.checked);

            if (!name) { alert('❌ Аты-жөніңізді енгізіңіз.'); return; }
            if (!anyChecked) { alert('❌ Кем дегенде бір тағам таңдаңыз.'); return; }

            let message = `✅ Сәлеметсіз бе, ${name}! Сіздің тапсырысыңыз қабылданды.\n`;
            if (currentDiscount > 0) {
                const saved = originalTotal - total;
                message += `💰 Бастапқы баға: ${originalTotal} ₸\n🏷️ Жеңілдік: ${saved} ₸ (20%)\n`;
            }
            message += `💵 Төлейтін сома: ${total} ₸\n⏱️ Тапсырысыңыз 20 минутта дайын болады.`;

            if (successDiv) {
                successDiv.style.display = 'block';
                successDiv.innerHTML = message.replace(/\n/g, '<br>');
            }
        });
    }

    // ===== БАСТАПҚЫ ИНИЦИАЛИЗАЦИЯ =====
    renderQuiz();
    updatePriceWithDiscount();
    checkboxes.forEach(cb => cb.addEventListener('change', updatePriceWithDiscount));

    if (viewMenuBtn) {
        viewMenuBtn.addEventListener('click', () => menuSection?.scrollIntoView({ behavior: 'smooth' }));
    }

    if (submitQuizBtn) submitQuizBtn.addEventListener('click', checkQuiz);

    if (resetQuizBtn) {
        resetQuizBtn.addEventListener('click', () => {
            document.querySelectorAll('input[type="radio"]').forEach(r => r.checked = false);
            document.querySelectorAll('.question-item').forEach(item => {
                item.classList.remove('correct', 'incorrect');
            });
            if (quizResult) quizResult.style.display = 'none';
            if (discountCodeDiv) discountCodeDiv.style.display = 'none';
            activeDiscountCode = null;
        });
    }

    console.log('✅ DeepSeek API жаңа кілтпен қосылды!');
})();

(function () {
    const stage = document.querySelector('.burger-stage');
    if (!stage) return;

    // Add replay button
    const replayBtn = document.createElement('button');
    replayBtn.className = 'burger-replay-btn';
    replayBtn.textContent = '🔄 Қайта көру';
    document.querySelector('.burger-animation-container').appendChild(replayBtn);

    function runAnimation() {
        // Step 1: Start assembled
        stage.className = 'burger-stage assembled';

        // Step 2: After 2.5s → explode
        setTimeout(() => {
            stage.classList.remove('assembled');
            stage.classList.add('exploded');
        }, 2500);

        // Step 3: After 5s → reassemble
        setTimeout(() => {
            stage.classList.remove('exploded');
            stage.classList.add('assembling');
            // Give transition time, then set assembled
            setTimeout(() => {
                stage.classList.remove('assembling');
                stage.classList.add('assembled');
            }, 800);
        }, 5500);
    }

    // Initial run
    runAnimation();

    // Replay on button click
    replayBtn.addEventListener('click', () => {
        stage.className = 'burger-stage';
        setTimeout(runAnimation, 50);
    });
})();
