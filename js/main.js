document.addEventListener('DOMContentLoaded', () => {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const navLinks = mobileMenu ? mobileMenu.querySelectorAll('a') : [];

    // --- Mobile Menu Toggle ---
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }

    // --- Close Mobile Menu on Link Click ---
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.add('hidden');
        });
    });

    // --- Simple Form Handler ---
    const volunteerForm = document.querySelector('#volunteer form');
    const formMessage = document.getElementById('form-message');

    if (volunteerForm && formMessage) {
        volunteerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            formMessage.classList.remove('hidden');
            volunteerForm.reset();
            setTimeout(() => { formMessage.classList.add('hidden'); }, 5000);
        });
    }
});
