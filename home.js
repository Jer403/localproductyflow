const switchButton = document.querySelector(".nav-switch")
switchButton.addEventListener("click", (e) => {
    document.querySelector(".nav-links").classList.toggle("nav-links-open")
    e.currentTarget.firstElementChild.classList.toggle("fa-close")
    e.currentTarget.firstElementChild.classList.toggle("fa-bars")
})