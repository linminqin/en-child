function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function getRandomOptions(correctAnswer, allAnswers, count = 4) {
    const options = [];  // 初始化空数组
    const otherAnswers = allAnswers.filter(a => a !== correctAnswer);
    const shuffledAnswers = shuffleArray([...otherAnswers]);
    
    // 80%的概率在选项中包含正确答案
    const includeCorrect = Math.random() < 0.80;
    
    if (includeCorrect) {
        options.push(correctAnswer);
        options.push(...shuffledAnswers.slice(0, 2));
    } else {
        options.push(...shuffledAnswers.slice(0, 3));
    }
    
    // 打乱前三个选项的顺序
    const shuffledOptions = shuffleArray(options);
    // 在最后添加"以上都不对"
    shuffledOptions.push("以上都不对");
    
    return {
        options: shuffledOptions,
        includesCorrect: includeCorrect
    };
}

function updateStats() {
    // 更新数字并添加动画的通用函数
    function updateWithAnimation(elementId, newValue, suffix = '') {
        const element = document.getElementById(elementId);
        const oldValue = elementId === 'successRate' ? 
            parseInt(element.textContent) : 
            parseInt(element.textContent || '0');
        const newValueNum = parseInt(newValue);

        if (oldValue !== newValueNum) {
            element.textContent = newValue + suffix;
            element.classList.add('highlight');
            setTimeout(() => {
                element.classList.remove('highlight');
            }, 500);
        }
    }

    updateWithAnimation('totalCount', stats.totalWords);
    updateWithAnimation('correctCount', stats.completedWords);
    updateWithAnimation('wrongCount', stats.wrongWords);
    
    const totalAttempts = stats.completedWords + stats.wrongWords;
    const newRate = totalAttempts === 0 ? 0 : 
        Math.round((stats.completedWords / totalAttempts) * 100);
    updateWithAnimation('successRate', newRate, '%');
}

function displayNewWord() {
    if (remainingWords.length === 0) {
        showCompletionMessage();
        return;
    }

    const randomIndex = Math.floor(Math.random() * remainingWords.length);
    currentWord = remainingWords[randomIndex];
    remainingWords.splice(randomIndex, 1);

    document.getElementById('currentWord').textContent = currentWord;

    const correctPhonetic = wordData[currentWord][0];
    const correctTranslation = wordData[currentWord][1];

    const phoneticResult = getRandomOptions(
        correctPhonetic,
        Object.values(wordData).map(v => v[0])
    );
    const translationResult = getRandomOptions(
        correctTranslation,
        Object.values(wordData).map(v => v[1])
    );

    // 存储选项信息，用于后续验证
    window.currentQuestion = {
        phoneticHasCorrect: phoneticResult.includesCorrect,
        translationHasCorrect: translationResult.includesCorrect,
        correctPhonetic: correctPhonetic,
        correctTranslation: correctTranslation
    };

    const phoneticGrid = document.getElementById('phoneticOptions');
    const translationGrid = document.getElementById('translationOptions');
    
    phoneticGrid.innerHTML = '';
    translationGrid.innerHTML = '';

    phoneticResult.options.forEach(option => {
        const div = document.createElement('div');
        div.className = 'option phonetic-option';
        div.textContent = option;
        div.onclick = () => {
            selectOption('phonetic', option, div);
            if (option !== '以上都不对') {
                for (const [word, [phonetic, _]] of Object.entries(wordData)) {
                    if (phonetic === option) {
                        speak(word);
                        break;
                    }
                }
            }
        };
        phoneticGrid.appendChild(div);
    });

    translationResult.options.forEach(option => {
        const div = document.createElement('div');
        div.className = 'option translation-option';
        div.textContent = option;
        div.onclick = () => selectOption('translation', option, div);
        translationGrid.appendChild(div);
    });

    selectedPhonetic = null;
    selectedTranslation = null;
}

function selectOption(type, value, element) {
    const options = document.querySelectorAll(`.${type}-option`);
    options.forEach(opt => opt.classList.remove('selected'));
    element.classList.add('selected');

    if (type === 'phonetic') {
        selectedPhonetic = value;
    } else {
        selectedTranslation = value;
    }

    if (selectedPhonetic && selectedTranslation) {
        checkAnswer();
    }
}

function checkAnswer() {
    const { phoneticHasCorrect, translationHasCorrect, correctPhonetic, correctTranslation } = window.currentQuestion;
    
    const isPhoneticCorrect = 
        (selectedPhonetic === correctPhonetic) || 
        (selectedPhonetic === "以上都不对" && !phoneticHasCorrect);
        
    const isTranslationCorrect = 
        (selectedTranslation === correctTranslation) || 
        (selectedTranslation === "以上都不对" && !translationHasCorrect);

    if (isPhoneticCorrect && isTranslationCorrect) {
        if (!wrongAttempts[currentWord]) {
            stats.completedWords++;
            updateStats();
        }
        
        // 显示正确答案
        document.querySelectorAll('.selected').forEach(el => {
            el.classList.add('correct');
            if (el.textContent === '以上都不对') {
                const isPhonetic = el.classList.contains('phonetic-option');
                el.textContent = isPhonetic ? correctPhonetic : correctTranslation;
            }
        });

        // 判断是否有选择"以上都不对"
        const hasSelectedNone = selectedPhonetic === "以上都不对" || selectedTranslation === "以上都不对";
        const delay = hasSelectedNone ? 3000 : 1000;  // 如果选择了"以上都不对"，等待3秒，否则等待1秒

        setTimeout(() => {
            displayNewWord();
        }, delay);
    } else {
        if (!wrongAttempts[currentWord]) {
            wrongAttempts[currentWord] = 0;
            stats.wrongWords++;
            updateStats();
        }
        wrongAttempts[currentWord]++;

        document.querySelectorAll('.selected').forEach(el => {
            el.classList.add('wrong');
        });

        setTimeout(() => {
            document.querySelectorAll('.option').forEach(el => {
                el.classList.remove('selected', 'wrong');
            });
            selectedPhonetic = null;
            selectedTranslation = null;
        }, 1000);
    }
}

function formatTime(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    if (minutes > 0) {
        return `${minutes}分${seconds}秒`;
    }
    return `${seconds}秒`;
}

function showCompletionMessage() {
    const endTime = Date.now();
    const duration = endTime - startTime;
    const timeText = formatTime(duration);

    const wrongWords = Object.entries(wrongAttempts)
        .filter(([_, attempts]) => attempts > 0)
        .sort((a, b) => b[1] - a[1])
        .map(([word, attempts]) => `${word}: 错误${attempts}次`);

    const totalAttempts = stats.completedWords + stats.wrongWords;
    const successRate = Math.round((stats.completedWords / totalAttempts) * 100);

    let message = '🎉 恭喜完成所有单词练习！\n\n';
    message += `总用时：${timeText}\n`;
    message += `总单词数: ${stats.totalWords}\n`;
    message += `正确次数: ${stats.completedWords}\n`;
    message += `错误次数: ${stats.wrongWords}\n`;
    message += `成功率: ${successRate}%\n\n`;

    if (wrongWords.length > 0) {
        message += '需要加强的单词：\n' + wrongWords.join('\n');
    } else {
        message += '太棒了！没有出现错误！';
    }

    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    `;

    const messageBox = document.createElement('div');
    messageBox.style.cssText = `
        background: white;
        padding: 20px;
        border-radius: 8px;
        max-width: 80%;
        max-height: 80%;
        overflow-y: auto;
        white-space: pre-line;
    `;
    messageBox.textContent = message;

    overlay.appendChild(messageBox);
    document.body.appendChild(overlay);

    overlay.onclick = () => {
        overlay.remove();
        location.reload();
    };
}