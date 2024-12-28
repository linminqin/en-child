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