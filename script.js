document.addEventListener('DOMContentLoaded', () => {
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                window.scrollTo({
                    top: target.offsetTop - 80, // Offset for sticky header
                    behavior: 'smooth'
                });
            }
        });
    });

    // Handle reservation form submission
    const bookingForm = document.getElementById('booking-form');
    const statusContainer = document.getElementById('reservation-status');
    // ↓ Google Apps Script (GAS) のURLをここに貼り付けてください
    const GAS_URL = 'https://script.google.com/macros/s/AKfycbwJ5eyu3rQQhBjYESFQmilnNr2yd90uYqlPNiX7zbvSK3jNCq7o3flEIA0D3ipwyj3I/exec';

    if (bookingForm) {
        bookingForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Show status
            bookingForm.style.display = 'none';
            statusContainer.style.display = 'block';
            const loadingText = statusContainer.querySelector('.status-loading');
            const successContent = statusContainer.querySelector('.status-success');

            loadingText.style.display = 'block';
            successContent.style.display = 'none';

            // Collect form data
            const formData = new FormData(bookingForm);
            const data = Object.fromEntries(formData.entries());

            // 1. Send to Google Calendar via GAS
            try {
                if (GAS_URL && GAS_URL !== 'YOUR_GAS_WEBAPP_URL_HERE') {
                    await fetch(GAS_URL, {
                        method: 'POST',
                        body: JSON.stringify(data)
                    });
                }
            } catch (error) {
                console.error('GAS Error:', error);
                // Continue to email submission even if GAS fails
            }

            // 2. Prepare Email (for double notification/confirmation)
            const emailTo = 'chainon.joli@gmail.com';
            const subject = encodeURIComponent('【予約/問合せ】chainonjoli ご予約依頼');
            let bodyContent = `お名前: ${data.name}\n`;
            bodyContent += `メールアドレス: ${data.email}\n`;
            bodyContent += `メニュー: ${data.menu}\n`;
            bodyContent += `希望日: ${data.date}\n\n`;
            bodyContent += `メッセージ:\n${data.message}\n`;
            const body = encodeURIComponent(bodyContent);
            const mailtoLink = `mailto:${emailTo}?subject=${subject}&body=${body}`;

            // Show success and open email
            loadingText.style.display = 'none';
            successContent.style.display = 'block';

            setTimeout(() => {
                window.location.href = mailtoLink;
            }, 1000);
        });
    }

    // Scroll animation (Fade in effect)
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // FAQ Accordion
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');

            // Close all other items
            faqItems.forEach(otherItem => {
                otherItem.classList.remove('active');
            });

            // Toggle current item
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });

    // Apply animation to sections
    document.querySelectorAll('section').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.8s ease, transform 0.8s ease';

        const revealEffect = () => {
            if (section.getBoundingClientRect().top < window.innerHeight * 0.9) {
                section.style.opacity = '1';
                section.style.transform = 'translateY(0)';
            }
        };

        window.addEventListener('scroll', revealEffect);
        revealEffect(); // Initial check
    });

    // Share Functionality
    const shareData = {
        title: 'chainonjoli | 伊勢市の隠れ家エステサロン',
        text: 'たった90分で、心がふっと軽くなる場所。伊勢市のシェノンジョリで贅沢なひとときを。',
        url: window.location.href
    };

    const shareX = document.getElementById('share-x');
    const shareFB = document.getElementById('share-facebook');
    const shareLine = document.getElementById('share-line');
    const shareLink = document.getElementById('share-link');

    if (shareX) shareX.href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareData.text)}&url=${encodeURIComponent(shareData.url)}`;
    if (shareFB) shareFB.href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareData.url)}`;
    if (shareLine) shareLine.href = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareData.url)}`;

    if (shareLink) {
        shareLink.addEventListener('click', async () => {
            if (navigator.share) {
                try {
                    await navigator.share(shareData);
                } catch (err) {
                    console.log('Error sharing:', err);
                }
            } else {
                try {
                    await navigator.clipboard.writeText(shareData.url);
                    const originalHTML = shareLink.innerHTML;
                    shareLink.innerHTML = '<i class="fas fa-check"></i>';
                    setTimeout(() => {
                        shareLink.innerHTML = originalHTML;
                    }, 2000);
                } catch (err) {
                    console.error('Failed to copy: ', err);
                }
            }
        });
    }

    // --- Chatbot Widget Logic ---
    const chatToggleBtn = document.getElementById('chat-toggle-btn');
    const chatWindow = document.getElementById('chat-window');
    const chatCloseBtn = document.getElementById('chat-close-btn');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const chatSendBtn = document.getElementById('chat-send-btn');
    const chatMessages = document.getElementById('chat-messages');
    const chatNotification = document.querySelector('.chat-notification');
    const quickActions = document.getElementById('chat-quick-actions');

    // ★ ここにお客様が作成したGASのWebアプリURLを設定します ★
    const CHATBOT_API_URL = 'https://script.google.com/macros/s/AKfycby0wtXjxBWdJHlrsvlI4k3nmxiAh7-XWV8gXrg6Iz2hwMT6B7DMeW3ngldSa5RbXGN6/exec';

    // Open/Close Chat
    function toggleChat() {
        chatWindow.classList.toggle('hidden');
        if (!chatWindow.classList.contains('hidden')) {
            // Hide notification badge when opened
            if (chatNotification) chatNotification.style.display = 'none';
            chatInput.focus();
        }
    }

    if (chatToggleBtn) chatToggleBtn.addEventListener('click', toggleChat);
    if (chatCloseBtn) chatCloseBtn.addEventListener('click', () => chatWindow.classList.add('hidden'));

    // 公式LINEの「肌のお守り相談」から来たときはチャットを自動で開く
    const pageParams = new URLSearchParams(window.location.search);
    if (pageParams.get('chat') === 'open' && chatWindow) {
        chatWindow.classList.remove('hidden');
        if (chatNotification) chatNotification.style.display = 'none';
        setTimeout(() => chatInput && chatInput.focus(), 300);
    }

    // Enable/Disable send button
    if (chatInput) {
        chatInput.addEventListener('input', () => {
            chatSendBtn.disabled = chatInput.value.trim() === '';
        });
    }

    // Add message to chat UI
    function addMessage(text, sender, options = {}) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        // Simple HTML escape and line break conversion
        contentDiv.innerHTML = text.replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;")
            .replace(/\n/g, "<br>");

        messageDiv.appendChild(contentDiv);

        if (options.lineLink) {
            const lineLink = document.createElement('a');
            lineLink.className = 'chat-line-link';
            lineLink.href = 'https://lin.ee/O1jhrwd';
            lineLink.target = '_blank';
            lineLink.rel = 'noopener';
            lineLink.textContent = '公式LINEでオーナーに相談';
            contentDiv.appendChild(document.createElement('br'));
            contentDiv.appendChild(lineLink);
        }
        chatMessages.appendChild(messageDiv);

        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Show typing indicator
    function showTyping() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'typing-indicator';
        typingDiv.id = 'typing-indicator';

        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('div');
            dot.className = 'typing-dot';
            typingDiv.appendChild(dot);
        }

        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Remove typing indicator
    function removeTyping() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    const urgentPatterns = [
        /息苦し|呼吸.*苦し|のど.*違和感|意識.*(遠|もうろう)/,
        /強い.*(腫れ|痛み|かゆみ)|急.*悪化|急に.*広が/,
        /目.*(腫れ|痛み)|口.*周り.*腫れ|じんましん|水ぶくれ|ただれ/,
        /出血.*(止まら|続)|膿.*広が/
    ];

    const stopUsePatterns = [
        /化粧水.*(しみ|ヒリ)|化粧品.*(しみ|ヒリ|赤み|かゆみ)/,
        /使い始め.*(赤|かゆ|腫)|新しい.*化粧品.*(赤|かゆ|痛)/
    ];

    function safetyReply(message) {
        if (urgentPatterns.some(pattern => pattern.test(message))) {
            return {
                text: 'その症状は、チャットだけで判断せず、早めに医療機関へ相談してください。息苦しさ、のどの違和感、意識が遠のく感じがある場合は、すぐに救急へ連絡してください。\n\n使用中の化粧品がある場合はいったん使用を止め、商品名や使用開始日を控えておきましょう。',
                lineLink: false
            };
        }
        if (stopUsePatterns.some(pattern => pattern.test(message))) {
            return {
                text: 'まず、症状が出た化粧品の使用をいったん止めてください。こすったり、別の商品を重ねたりせず、肌を休ませましょう。\n\n赤み・腫れ・かゆみ・痛みが続く、または強くなる場合は皮膚科へご相談ください。商品名、使った日時、症状が出た時刻をメモしておくと相談しやすくなります。',
                lineLink: true
            };
        }
        return null;
    }

    function ownerHandoff() {
        addMessage('もちろんです。今の症状や気になることを短く入力してください。内容を整理したうえで、公式LINEからオーナーへ相談できます。\n\n例：3日前から鼻の下に赤い吹き出物があり、少し痛みます。新しく使い始めた化粧品はありません。', 'bot', { lineLink: true });
    }

    if (quickActions) {
        quickActions.addEventListener('click', (event) => {
            const button = event.target.closest('button');
            if (!button) return;
            if (button.dataset.action === 'owner') {
                ownerHandoff();
                return;
            }
            chatInput.value = button.dataset.message || '';
            chatSendBtn.disabled = !chatInput.value;
            chatForm.requestSubmit();
        });
    }

    // Handle form submission
    if (chatForm) {
        chatForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const messageText = chatInput.value.trim();
            if (!messageText) return;

            // 1. Add user message
            addMessage(messageText, 'user');

            // Clear input & disable button
            chatInput.value = '';
            chatSendBtn.disabled = true;

            const localSafetyReply = safetyReply(messageText);
            if (localSafetyReply) {
                setTimeout(() => addMessage(localSafetyReply.text, 'bot', localSafetyReply), 350);
                return;
            }

            if (/オーナー.*相談|人に相談|直接相談/.test(messageText)) {
                setTimeout(ownerHandoff, 350);
                return;
            }

            // 2. Show typing indicator
            showTyping();

            // 3. Send to GAS
            try {
                if (CHATBOT_API_URL === 'YOUR_GAS_WEBAPP_URL_HERE') {
                    // Simulate a response if URL is not set yet
                    setTimeout(() => {
                        removeTyping();
                        addMessage('現在、チャットシステムを準備中です。\nご予約・お問い合わせは「公式LINE」またはご予約フォームからお願いいたします。', 'bot');
                    }, 1500);
                    return;
                }

                const response = await fetch(CHATBOT_API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'text/plain', // application/jsonだとCORSエラーになるため
                    },
                    body: JSON.stringify({
                        message: messageText,
                        context: '匿名の肌相談。診断・治療の断定は禁止。結論→今できること→確認質問→必要なら相談先の順で、短くやさしく回答する。',
                        salon: 'chainonjoli（シャンソン化粧品特約店）'
                    })
                });

                const data = await response.json();

                removeTyping();
                if (data && data.reply) {
                    addMessage(data.reply.replace(/あづさ/g, 'オーナー'), 'bot');
                } else {
                    addMessage('申し訳ありません、メッセージの処理中にエラーが発生しました。', 'bot');
                }

            } catch (error) {
                console.error('Chat Error:', error);
                removeTyping();
                addMessage('通信エラーが発生しました。時間をおいて再度お試しいただくか、LINEからお問い合わせください。', 'bot');
            }
        });
    }
});
