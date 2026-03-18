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

    // ★ ここにお客様が作成したGASのWebアプリURLを設定します ★
    const CHATBOT_API_URL = 'https://script.google.com/macros/s/AKfycby-T72muk7E3qacXOflnXPghcNdqkU3Cxj1y11HcyraC8OmBESvCosJQtpaL0FBUZcc/exec';

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

    // Enable/Disable send button
    if (chatInput) {
        chatInput.addEventListener('input', () => {
            chatSendBtn.disabled = chatInput.value.trim() === '';
        });
    }

    // Add message to chat UI
    function addMessage(text, sender) {
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
                    body: JSON.stringify({ message: messageText })
                });

                const data = await response.json();

                removeTyping();
                if (data && data.reply) {
                    addMessage(data.reply, 'bot');
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
