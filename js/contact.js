// =========================================
// CONTACT FORM LOGIC (WHATSAPP & EMAIL)
// =========================================

document.addEventListener('DOMContentLoaded', () => {
    
    const whatsappBtn = document.getElementById('whatsappBtn');
    const formFeedback = document.getElementById('formFeedback');
    const enquiryForm = document.getElementById('enquiryForm');
    const nextUrlInput = document.getElementById('nextUrlInput');

    // Your configured WhatsApp Number
    const TUTOR_WHATSAPP_NUMBER = "918240377262"; 

    // =========================================
    // 1. WHATSAPP LOGIC
    // =========================================
    if (whatsappBtn) {
        whatsappBtn.addEventListener('click', () => {
            
            // Gather Data
            const sName = document.getElementById('studentName').value.trim();
            const pName = document.getElementById('parentName').value.trim();
            const email = document.getElementById('email').value.trim();
            const phone = document.getElementById('phone').value.trim();
            const classSelect = document.getElementById('classSelect').value;
            const subject = document.getElementById('subjectSelect').value;
            const mode = document.getElementById('modeSelect').value;
            const message = document.getElementById('message').value.trim();

            // Simple Validation
            if (!sName || !email || !phone || !classSelect || !subject || !mode) {
                formFeedback.style.display = 'block';
                formFeedback.style.color = '#ff4d4d'; // Red error
                formFeedback.innerText = "Please fill in all required fields (*) before sending via WhatsApp.";
                return;
            }

            formFeedback.style.display = 'none';

            // Format Message
            let waMessage = `*New Enquiry from EDU SPACE Website*%0A%0A`;
            waMessage += `*Student Name:* ${sName}%0A`;
            if (pName) waMessage += `*Parent Name:* ${pName}%0A`;
            waMessage += `*Email:* ${email}%0A`;
            waMessage += `*Phone:* ${phone}%0A`;
            waMessage += `*Class:* ${classSelect}%0A`;
            waMessage += `*Subject:* ${subject}%0A`;
            waMessage += `*Preferred Mode:* ${mode}%0A`;
            
            if (message) {
                waMessage += `%0A*Message:* ${message}`;
            }

            // Open WhatsApp
            const waUrl = `https://wa.me/${TUTOR_WHATSAPP_NUMBER}?text=${waMessage}`;
            window.open(waUrl, '_blank');
        });
    }

    // =========================================
    // 2. FORMSUBMIT (EMAIL) LOGIC
    // =========================================
    
    if (enquiryForm && nextUrlInput) {
        // Dynamically set the 'next' URL so FormSubmit brings them back to this exact page
        // We add '?success=true' to the URL so our script knows they just submitted successfully
        nextUrlInput.value = window.location.href.split('?')[0] + "?success=true";
    }

    // Check if the URL has ?success=true (meaning they just returned from FormSubmit)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
        if (formFeedback) {
            formFeedback.style.display = 'block';
            formFeedback.style.color = '#00e5ff'; // Cyan success color
            formFeedback.innerText = "Thank you! Your enquiry has been sent via email successfully. I will contact you shortly.";
        }
        // Clean the URL so the message doesn't stay on refresh
        window.history.replaceState({}, document.title, window.location.pathname);
    }
});