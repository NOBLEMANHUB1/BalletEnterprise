// Simple rule-based FAQ chatbot — no AI API, just keyword matching against
// a preset list of Q&A pairs. Falls back to a WhatsApp link for anything
// it doesn't recognize.

const FAQ_RULES = [
  {
    keywords: ['hi', 'hello', 'hey', 'good morning', 'good afternoon'],
    reply: "Hi there! 👋 I'm the Ballet Enterprise assistant. Ask me about shipping, pre-orders, payments, returns, or your order — I'll do my best to help."
  },
  {
    keywords: ['ship', 'deliver', 'delivery', 'how long'],
    reply: "We deliver nationwide across Ghana. Items marked \"Available in Ghana\" usually ship within 2–4 business days after your order is placed."
  },
  {
    keywords: ['pre-order', 'preorder', 'pre order'],
    reply: "Pre-order items are newly released products reserved in advance. Each pre-order listing shows an estimated \"Ships in X weeks\" timeframe on the product page."
  },
  {
    keywords: ['pay', 'payment', 'momo', 'mobile money', 'card'],
    reply: "We accept Mobile Money, debit/credit cards, and Cash on Delivery at checkout — pick whichever works best for you."
  },
  {
    keywords: ['return', 'exchange', 'refund'],
    reply: "We accept returns within 7 days of delivery for unused items in their original packaging. Message us on WhatsApp to start a return."
  },
  {
    keywords: ['track', 'order status', 'where is my order', 'my order'],
    reply: "You can check your order status anytime under \"My Account\" → Order History after signing in."
  },
  {
    keywords: ['sign in', 'sign up', 'account', 'login', 'log in', 'password'],
    reply: "You can create an account or sign in using the Sign Up / Sign In buttons in the top navigation menu."
  },
  {
    keywords: ['price', 'discount', 'sale', 'cheap', 'cost'],
    reply: "Prices are listed on each product page. Keep an eye on our homepage banner for seasonal discounts and pre-order deals!"
  },
  {
    keywords: ['human', 'agent', 'talk to someone', 'contact', 'whatsapp'],
    reply: 'WHATSAPP_PROMPT'
  },
  {
    keywords: ['thank', 'thanks'],
    reply: "You're welcome! Let me know if there's anything else I can help with. 🙂"
  }
];

const FALLBACK_REPLY = 'WHATSAPP_PROMPT';

function findFaqReply(message) {
  const lower = message.toLowerCase();
  const match = FAQ_RULES.find(rule => rule.keywords.some(kw => lower.includes(kw)));
  return match ? match.reply : FALLBACK_REPLY;
}

document.addEventListener('DOMContentLoaded', function () {

  // ---- Build the widget ----
  const toggleBtn = document.createElement('button');
  toggleBtn.className = 'chatbot-toggle';
  toggleBtn.setAttribute('aria-label', 'Open chat assistant');
  toggleBtn.innerHTML = '💬';

  const chatWindow = document.createElement('div');
  chatWindow.className = 'chatbot-window';
  chatWindow.innerHTML = `
    <div class="chatbot-header">
      <span>Ballet Enterprise Assistant</span>
      <button class="chatbot-close" aria-label="Close chat">&times;</button>
    </div>
    <div class="chatbot-messages" id="chatbotMessages"></div>
    <form class="chatbot-input-row" id="chatbotForm">
      <input type="text" id="chatbotInput" placeholder="Ask a question..." autocomplete="off">
      <button type="submit" aria-label="Send">&#8594;</button>
    </form>
  `;

  document.body.appendChild(toggleBtn);
  document.body.appendChild(chatWindow);

  const messagesEl = chatWindow.querySelector('#chatbotMessages');
  const formEl = chatWindow.querySelector('#chatbotForm');
  const inputEl = chatWindow.querySelector('#chatbotInput');
  const closeBtn = chatWindow.querySelector('.chatbot-close');

  function addMessage(text, sender, isHtml) {
    const bubble = document.createElement('div');
    bubble.className = `chatbot-bubble ${sender}`;
    if (isHtml) {
      bubble.innerHTML = text;
    } else {
      bubble.textContent = text;
    }
    messagesEl.appendChild(bubble);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function whatsappPromptHTML() {
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi! I need help with something not covered by the FAQ bot.")}`;
    return `I'm not totally sure about that one — want to chat with our team directly? <a href="${url}" target="_blank" rel="noopener noreferrer" class="chatbot-whatsapp-link">Chat on WhatsApp →</a>`;
  }

  let greeted = false;

  function openChat() {
    chatWindow.classList.add('open');
    toggleBtn.classList.add('open');
    if (!greeted) {
      addMessage("Hi! 👋 Ask me about shipping, pre-orders, payments, returns, or your order.", 'bot');
      greeted = true;
    }
    inputEl.focus();
  }

  function closeChat() {
    chatWindow.classList.remove('open');
    toggleBtn.classList.remove('open');
  }

  toggleBtn.addEventListener('click', function () {
    chatWindow.classList.contains('open') ? closeChat() : openChat();
  });

  closeBtn.addEventListener('click', closeChat);

  formEl.addEventListener('submit', function (e) {
    e.preventDefault();
    const message = inputEl.value.trim();
    if (!message) return;

    addMessage(message, 'user');
    inputEl.value = '';

    const reply = findFaqReply(message);

    setTimeout(function () {
      if (reply === 'WHATSAPP_PROMPT') {
        addMessage(whatsappPromptHTML(), 'bot', true);
      } else {
        addMessage(reply, 'bot');
      }
    }, 400); // small delay so it feels like a real reply, not instant
  });
});