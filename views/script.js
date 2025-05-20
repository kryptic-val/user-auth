const wrapper = document.querySelector('.wrapper');
const loginLink = document.querySelector('.loginLink');
const registerLink = document.querySelector('.registerLink');
const loginBtn = document.querySelector('.loginBtn');
const close = document.querySelector('.close');

registerLink.addEventListener('click', ()=> {
    wrapper.classList.add('active');
});

loginLink.addEventListener('click', ()=> {
    wrapper.classList.remove('active');
});

loginBtn.addEventListener('click', ()=> {
    wrapper.classList.add('activePopup');
});

close.addEventListener('click', ()=> {
    wrapper.classList.remove('activePopup');
});