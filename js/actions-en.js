
// 显示英语单词
function displayNewEnWord() {
    if (remainingWords.length === 0) {
        showCompletionMessage();
        return;
    }

    const randomIndex = Math.floor(Math.random() * remainingWords.length);
    currentWord = remainingWords[randomIndex];
    remainingWords.splice(randomIndex, 1);

    // 显示音标、翻译和喇叭标
    const wordDisplay = document.getElementById('currentWord');
    wordDisplay.innerHTML = `
        ${wordData[currentWord][0]} 
        <span class="speaker-icon" onclick="speak('${currentWord}')">🔊</span> 
        (${wordData[currentWord][1]}) 
        <span id="phoneticHint" style="color: #666; font-size: 0.9em;"></span>
    `;
    
    // 清空已选字符
    selectedChars = [];
    updatePhoneticInput();
    
    // 将单词字母打散显示
    const letters = currentWord.split('');
    // 添加元音字母
    letters.push('a', 'e', 'i', 'o', 'u', 'y');
    // 添加3-5个随机字符
    const extraChars = 'abcdefghijklmnopqrstuvwxyz';
    const numExtra = Math.floor(Math.random() * 3) + 3; // 随机生成3-5
    for (let i = 0; i < numExtra; i++) {
        const randomChar = extraChars[Math.floor(Math.random() * extraChars.length)];
        letters.push(randomChar);
    }
    
    const shuffledLetters = shuffleArray([...letters]);
    
    // 显示打散的字母，找到原单词中的首字母位置
    const charsContainer = document.getElementById('phoneticChars');
    charsContainer.innerHTML = '';
    shuffledLetters.forEach(letter => {
        const div = document.createElement('div');
        div.className = 'char';
        // 如果这个字母在原单词中是首字母，就显示大写，否则显示小写
        const isFirstLetter = letter.toLowerCase() === currentWord.charAt(0).toLowerCase();
        div.textContent = isFirstLetter ? letter.toUpperCase() : letter.toLowerCase();
        div.onclick = () => selectChar(letter, div);
        charsContainer.appendChild(div);
    });

    // 在输入区域创建占位符时，确保首字母大写，其余小写
    const inputContainer = document.getElementById('phoneticInput');
    inputContainer.innerHTML = '';
    letters.forEach((_, index) => {
        const span = document.createElement('span');
        span.className = 'phonetic-placeholder';
        span.style.minWidth = '20px';
        span.style.display = 'inline-block';
        inputContainer.appendChild(span);
    });

    document.getElementById('submitBtn').disabled = true;
}


// 检查英文单词
function checkEnAnswer() {
    // 将用户输入的答案首字母大写，其余小写
    const assembledWord = selectedChars.join('');
    // 忽略大小写
    const isCorrect = assembledWord.toUpperCase() === currentWord.toUpperCase();
    
    if (isCorrect) {
        // 正确处理逻辑...
        if (!wrongAttempts[currentWord]) {
            stats.completedWords++;
            updateStats();
        }
        
        speak(currentWord);

        const feedback = document.createElement('div');
        feedback.textContent = '正确！';
        feedback.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: rgba(76, 175, 80, 0.9);
            color: white;
            padding: 20px 40px;
            border-radius: 8px;
            z-index: 1000;
        `;
        document.body.appendChild(feedback);
        
        setTimeout(() => {
            feedback.remove();
            displayNewEnWord();
        }, 1000);
    } else {
        // 错误处理逻辑
        if (!wrongAttempts[currentWord]) {
            wrongAttempts[currentWord] = 0;
            stats.wrongWords++;
            updateStats();
        }
        wrongAttempts[currentWord]++;

        // 如果连续错误三次，显示正确单词
        if (wrongAttempts[currentWord] % 3 === 0) {
            const phoneticHint = document.getElementById('phoneticHint');
            phoneticHint.textContent = ` (正确答案: ${currentWord})`;
        }

        // 显示错误提示
        const feedback = document.createElement('div');
        feedback.textContent = '错误，请重试！';
        feedback.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: rgba(244, 67, 54, 0.9);
            color: white;
            padding: 20px 40px;
            border-radius: 8px;
            z-index: 1000;
        `;
        document.body.appendChild(feedback);
        
        setTimeout(() => {
            feedback.remove();
            // 清空选择
            selectedChars = [];
            updatePhoneticInput();
            document.querySelectorAll('.char').forEach(el => {
                el.classList.remove('selected');
            });
            document.getElementById('submitBtn').disabled = true;
            document.getElementById('backspaceBtn').disabled = true;
        }, 1000);
    }
}
        // 将标字符串转换为字符数组
        function splitPhonetic(phonetic) {
            const specialChars = ['ˈ', 'ˌ', 'ː'];
            let chars = [];
            
            for (let char of phonetic) {
                if (char !== ' ') {
                    chars.push(char);
                }
            }
            return chars;
        }

        function shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        }

        function updateStats() {
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

        function selectChar(char, element) {
            if (element.classList.contains('selected')) {
                // 取消选择
                element.classList.remove('selected');
                // 找到当前字符在selectedChars中的位置并移除
                const charToRemove = element.textContent;
                const index = selectedChars.findIndex(c => 
                    c.toLowerCase() === charToRemove.toLowerCase()
                );
                if (index !== -1) {
                    selectedChars.splice(index, 1);
                }
            } else {
                // 选择字符
                element.classList.add('selected');
                selectedChars.push(char);
            }
            
            updatePhoneticInput();
            // 更新两个按钮的状态
            const hasChars = selectedChars.length > 0;
            document.getElementById('submitBtn').disabled = !hasChars;
            document.getElementById('backspaceBtn').disabled = !hasChars;
        }

        function updatePhoneticInput() {
            const inputContainer = document.getElementById('phoneticInput');
            inputContainer.innerHTML = '';
            
            // 直接使用 selectedChars 数组中的字符，保持选择顺序
            selectedChars.forEach((char, index) => {
                const span = document.createElement('span');
                // 如果是第一个字母则大写，其余小写
                span.textContent = index === 0 ? char.toUpperCase() : char.toLowerCase();
                span.className = 'phonetic-placeholder';
                span.style.minWidth = '20px';
                span.style.display = 'inline-block';
                inputContainer.appendChild(span);
            });
            
            // 添加剩余的占位符
            const remainingPlaceholders = currentWord.length - selectedChars.length;
            for (let i = 0; i < remainingPlaceholders; i++) {
                const span = document.createElement('span');
                span.className = 'phonetic-placeholder';
                span.style.minWidth = '20px';
                span.style.display = 'inline-block';
                inputContainer.appendChild(span);
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