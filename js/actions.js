
// 读单词
function speak(text) {
    try {
        // 确保语音合成已初始化
        if (!window.speechSynthesis) {
            console.error('Speech synthesis not supported');
            return;
        }
        
        // 移除音标中的方括号和其他特殊字符
        const cleanText = text.replace(/[\[\]]/g, '').replace(/ˈ|ˌ/g, '');
        
        // 取消所有正在进行的发音
        window.speechSynthesis.cancel();
        
        // 创建新的发音请求
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = 'en-US';
        // 获取所有可用的语音
        const voices = window.speechSynthesis.getVoices();
        // 按优先级选择男声
        const voice = voices.find(v => 
            v.name.includes('Google US English Male') ||  // Android 美式男声
            v.name.includes('Microsoft David') ||     // Windows 男声
            v.name.includes('Alex') ||               // Mac 男声
            v.name.includes('Male') ||              // 其他男声
            v.name.includes('英语') ||              // 中文系统的英语声音
            v.lang.startsWith('en-')               // 任何英语声音
        );
        if (voice) {
            utterance.voice = voice;
        }
        utterance.rate = 0.9;  // 稍微慢一点的语速
        utterance.volume = 1;
        utterance.pitch = 0.9;  // 稍微低一点的音调
        
        // 添加错误处理
        utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event);
        };
        
        // 尝试播放
        window.speechSynthesis.speak(utterance);
    } catch (error) {
        console.error('Speech synthesis error:', error);
    }
} 


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